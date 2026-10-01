import type * as EsbuildModule from "esbuild-wasm";
import type { Loader, OnLoadResult, Plugin } from "esbuild-wasm";

import { getExtension } from "@/features/languages/registry";

import type { WebWorkspace, WorkspaceFile } from "./workspace";
import { normalizePath } from "./workspace";

export interface BundleDiagnostic {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: "error" | "warning";
}

export interface BundleResult {
  code: string;
  css: string;
  diagnostics: BundleDiagnostic[];
  durationMs: number;
}

const NAMESPACE = "workspace";

const LOADERS: Record<string, Loader> = {
  ".ts": "ts",
  ".mts": "ts",
  ".cts": "ts",
  ".d.ts": "ts",
  ".tsx": "tsx",
  ".js": "js",
  ".mjs": "js",
  ".cjs": "js",
  ".jsx": "jsx",
  ".json": "json",
  ".css": "css",
  ".txt": "text",
  ".md": "text",
};

const RESOLVE_EXTENSIONS = [
  "",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".vue",
  ".svelte",
  ".json",
  ".css",
  "/index.ts",
  "/index.tsx",
  "/index.js",
];

type Esbuild = typeof EsbuildModule;

let initialization: Promise<Esbuild> | null = null;

async function initializeEsbuild(esbuild: Esbuild): Promise<void> {
  try {
    const { default: wasmURL } = await import("esbuild-wasm/esbuild.wasm?url");
    await esbuild.initialize({ wasmURL });
  } catch (error) {
    if (String(error).includes("more than once")) {
      return;
    }

    await esbuild.initialize({});
  }
}

async function getEsbuild(): Promise<Esbuild> {
  if (!initialization) {
    initialization = (async () => {
      const esbuild = await import("esbuild-wasm");
      await initializeEsbuild(esbuild);
      return esbuild;
    })().catch((error: unknown) => {
      initialization = null;
      throw error;
    });
  }

  return initialization;
}

function directoryOf(path: string): string {
  const slash = path.lastIndexOf("/");

  return slash === -1 ? "" : path.slice(0, slash);
}

function resolveRelative(importer: string, specifier: string): string {
  const base = directoryOf(importer).split("/").filter(Boolean);
  const parts = specifier.split("/");

  for (const part of parts) {
    if (part === "." || part === "") {
      continue;
    }

    if (part === "..") {
      base.pop();
      continue;
    }

    base.push(part);
  }

  return base.join("/");
}

function findCandidate(workspace: WebWorkspace, candidate: string): WorkspaceFile | undefined {
  for (const suffix of RESOLVE_EXTENSIONS) {
    const target = normalizePath(`${candidate}${suffix}`);
    const file = workspace.files.find((entry) => entry.path === target);

    if (file) {
      return file;
    }
  }

  return undefined;
}

async function compileVue(file: WorkspaceFile): Promise<OnLoadResult> {
  const compiler = await import("@vue/compiler-sfc");
  const id = file.path.replace(/[^a-z0-9]/gi, "");
  const { descriptor, errors } = compiler.parse(file.content, { filename: file.path });

  if (errors.length > 0) {
    return {
      errors: errors.map((error) => ({
        text: typeof error === "string" ? error : error.message,
        location: { file: file.path },
      })),
    };
  }

  const scoped = descriptor.styles.some((style) => style.scoped);
  const script = compiler.compileScript(descriptor, {
    id,
    inlineTemplate: Boolean(descriptor.scriptSetup),
    templateOptions: { compilerOptions: { scopeId: scoped ? `data-v-${id}` : undefined } },
  });

  const typescript = script.lang === "ts" || script.lang === "tsx";
  const parts: string[] = [
    compiler.rewriteDefault(script.content, "__component", typescript ? ["typescript"] : []),
  ];

  if (!descriptor.scriptSetup && descriptor.template) {
    const template = compiler.compileTemplate({
      id,
      filename: file.path,
      source: descriptor.template.content,
      compilerOptions: { scopeId: scoped ? `data-v-${id}` : undefined },
    });

    parts.push(template.code, "__component.render = render;");
  }

  if (scoped) {
    parts.push(`__component.__scopeId = "data-v-${id}";`);
  }

  for (const [index, style] of descriptor.styles.entries()) {
    const compiled = compiler.compileStyle({
      id: `data-v-${id}`,
      filename: `${file.path}?style=${index}`,
      source: style.content,
      scoped: style.scoped ?? false,
    });

    parts.push(
      `(function () { const el = document.createElement("style"); el.textContent = ${JSON.stringify(compiled.code)}; document.head.append(el); })();`,
    );
  }

  parts.push("export default __component;");

  return {
    contents: parts.join("\n"),
    loader: (script.lang === "ts" ? "ts" : "js") as Loader,
  };
}

async function compileSvelte(file: WorkspaceFile): Promise<OnLoadResult> {
  const { compile } = await import("svelte/compiler");

  try {
    const compiled = compile(file.content, {
      filename: file.path,
      generate: "client",
      css: "injected",
    });

    return { contents: compiled.js.code, loader: "js" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const position = (error as { start?: { line?: number; column?: number } }).start;

    return {
      errors: [
        {
          text: message,
          location: {
            file: file.path,
            line: position?.line ?? 1,
            column: position?.column ?? 0,
          },
        },
      ],
    };
  }
}

function workspacePlugin(workspace: WebWorkspace, collectedCss: string[]): Plugin {
  return {
    name: "workspace",
    setup(build) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === "entry-point") {
          return { path: normalizePath(args.path), namespace: NAMESPACE };
        }

        if (args.path.startsWith(".") || args.path.startsWith("/")) {
          const candidate = resolveRelative(args.importer, args.path);
          const file = findCandidate(workspace, candidate);

          if (!file) {
            return {
              errors: [
                {
                  text: `File "${args.path}" was not found in the workspace`,
                  location: { file: args.importer },
                },
              ],
            };
          }

          return { path: file.path, namespace: NAMESPACE };
        }

        return { path: args.path, external: true };
      });

      build.onLoad({ filter: /.*/, namespace: NAMESPACE }, async (args) => {
        const file = workspace.files.find((entry) => entry.path === args.path);

        if (!file) {
          return { errors: [{ text: `Missing file "${args.path}"` }] };
        }

        const extension = getExtension(file.path);

        if (extension === ".vue") {
          return compileVue(file);
        }

        if (extension === ".svelte") {
          return compileSvelte(file);
        }

        if (extension === ".css") {
          collectedCss.push(file.content);
          return { contents: "", loader: "js" };
        }

        return { contents: file.content, loader: LOADERS[extension] ?? "text" };
      });
    },
  };
}

interface EsbuildMessage {
  text: string;
  location?: { file?: string; line?: number; column?: number } | null;
}

function toDiagnostics(
  messages: readonly EsbuildMessage[],
  severity: "error" | "warning",
): BundleDiagnostic[] {
  return messages.map((message) => ({
    file: normalizePath((message.location?.file ?? "").replace(`${NAMESPACE}:`, "")),
    line: message.location?.line ?? 1,
    column: (message.location?.column ?? 0) + 1,
    message: message.text,
    severity,
  }));
}

export async function bundleEntry(
  workspace: WebWorkspace,
  entryPath: string,
): Promise<BundleResult> {
  const startedAt = Date.now();
  const collectedCss: string[] = [];

  try {
    const esbuild = await getEsbuild();
    const result = await esbuild.build({
      entryPoints: [normalizePath(entryPath)],
      bundle: true,
      write: false,
      format: "esm",
      target: "es2020",
      jsx: "automatic",
      jsxImportSource: workspace.dependencies["preact"] ? "preact" : "react",
      logLevel: "silent",
      plugins: [workspacePlugin(workspace, collectedCss)],
    });

    const code = result.outputFiles?.map((file) => file.text).join("\n") ?? "";

    return {
      code,
      css: collectedCss.join("\n"),
      diagnostics: toDiagnostics(result.warnings as EsbuildMessage[], "warning"),
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    const failure = error as {
      errors?: EsbuildMessage[];
      warnings?: EsbuildMessage[];
      message?: string;
    };
    const diagnostics = [
      ...toDiagnostics(failure.errors ?? [], "error"),
      ...toDiagnostics(failure.warnings ?? [], "warning"),
    ];

    return {
      code: "",
      css: collectedCss.join("\n"),
      diagnostics:
        diagnostics.length > 0
          ? diagnostics
          : [
              {
                file: normalizePath(entryPath),
                line: 1,
                column: 1,
                message: failure.message ?? String(error),
                severity: "error",
              },
            ],
      durationMs: Date.now() - startedAt,
    };
  }
}
