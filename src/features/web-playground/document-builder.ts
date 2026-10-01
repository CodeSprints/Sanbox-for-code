import { getExtension } from "@/features/languages/registry";

import { bundleEntry, type BundleDiagnostic } from "./bundler";
import { buildImportMap } from "./dependencies";
import { renderEjs, renderMarkdown } from "./markup";
import { UI_LIBRARY_TAGS } from "./ui-libraries";
import { findFile, normalizePath, type WebWorkspace } from "./workspace";

export interface PreviewBuild {
  document: string;
  diagnostics: BundleDiagnostic[];
  durationMs: number;
}

const BRIDGE = `<script>
(function () {
  var send = function (level, args) {
    try {
      parent.postMessage({
        source: "code-sandbox-preview",
        level: level,
        message: Array.prototype.map.call(args, function (value) {
          if (value instanceof Error) { return value.stack || value.message; }
          if (typeof value === "object" && value !== null) {
            try { return JSON.stringify(value); } catch (error) { return String(value); }
          }
          return String(value);
        }).join(" "),
        time: Date.now()
      }, "*");
    } catch (error) {
      void error;
    }
  };

  ["log", "info", "warn", "error", "debug"].forEach(function (level) {
    var original = console[level];
    console[level] = function () {
      send(level === "debug" ? "log" : level, arguments);
      if (original) { original.apply(console, arguments); }
    };
  });

  window.addEventListener("error", function (event) {
    send("error", [(event.error && (event.error.stack || event.error.message)) || event.message]);
  });

  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    send("error", ["Unhandled promise rejection: " + ((reason && (reason.stack || reason.message)) || reason)]);
  });
})();
</script>`;

const DOCUMENT_STYLES = `<style>
  :root { color-scheme: light dark; }
  body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }
  .code-sandbox-document { max-width: 52rem; margin: 0 auto; padding: 2rem 1.25rem; line-height: 1.65; }
  .code-sandbox-document pre { overflow: auto; padding: 1rem; border-radius: 0.5rem; background: rgb(15 23 42 / 0.9); color: #e2e8f0; }
  .code-sandbox-document table { border-collapse: collapse; width: 100%; }
  .code-sandbox-document th, .code-sandbox-document td { border: 1px solid currentColor; padding: 0.375rem 0.625rem; }
</style>`;

function escapeClosingTags(source: string): string {
  return source.replace(/<\/script>/gi, "<\\/script>");
}

function importMapTag(workspace: WebWorkspace): string {
  if (Object.keys(workspace.dependencies).length === 0) {
    return "";
  }

  return `<script type="importmap">${JSON.stringify(buildImportMap(workspace.dependencies))}</script>`;
}

function headExtras(workspace: WebWorkspace): string {
  return [UI_LIBRARY_TAGS[workspace.uiLibrary], importMapTag(workspace), BRIDGE]
    .filter((entry) => entry.length > 0)
    .join("\n");
}

function wrapDocument(workspace: WebWorkspace, body: string, language: string): string {
  return `<!doctype html>
<html lang="${language}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Code Sandbox preview</title>
${DOCUMENT_STYLES}
${headExtras(workspace)}
</head>
<body>
${body}
</body>
</html>`;
}

function injectIntoHead(document: string, injection: string): string {
  if (/<head[^>]*>/i.test(document)) {
    return document.replace(/<head[^>]*>/i, (match) => `${match}\n${injection}`);
  }

  if (/<html[^>]*>/i.test(document)) {
    return document.replace(/<html[^>]*>/i, (match) => `${match}\n<head>${injection}</head>`);
  }

  return `${injection}\n${document}`;
}

async function buildHtmlEntry(workspace: WebWorkspace, entryPath: string): Promise<PreviewBuild> {
  const entry = findFile(workspace, entryPath);
  const diagnostics: BundleDiagnostic[] = [];
  let durationMs = 0;

  if (!entry) {
    return {
      document: wrapDocument(workspace, "<p>Entry file not found.</p>", "en"),
      diagnostics: [
        {
          file: normalizePath(entryPath),
          line: 1,
          column: 1,
          message: "Entry file not found",
          severity: "error",
        },
      ],
      durationMs,
    };
  }

  let document = entry.content;
  const styles: string[] = [];

  document = document.replace(
    /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi,
    (match, href: string) => {
      const file = findFile(workspace, href);

      if (!file) {
        return match;
      }

      return `<style>${file.content}</style>`;
    },
  );

  const scriptPattern = /<script\b[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi;
  const scriptMatches = [...document.matchAll(scriptPattern)];

  for (const match of scriptMatches) {
    const href = match[1] ?? "";
    const file = findFile(workspace, href);

    if (!file) {
      continue;
    }

    const bundle = await bundleEntry(workspace, file.path);
    diagnostics.push(...bundle.diagnostics);
    durationMs += bundle.durationMs;

    if (bundle.css.length > 0) {
      styles.push(bundle.css);
    }

    document = document.replace(
      match[0],
      `<script type="module">${escapeClosingTags(bundle.code)}</script>`,
    );
  }

  const injection = [
    styles.length > 0 ? `<style>${styles.join("\n")}</style>` : "",
    headExtras(workspace),
  ]
    .filter((entryValue) => entryValue.length > 0)
    .join("\n");

  return { document: injectIntoHead(document, injection), diagnostics, durationMs };
}

async function buildMarkdownEntry(
  workspace: WebWorkspace,
  entryPath: string,
  language: string,
): Promise<PreviewBuild> {
  const entry = findFile(workspace, entryPath);
  const html = entry ? await renderMarkdown(entry.content) : "<p>Entry file not found.</p>";

  return {
    document: wrapDocument(
      workspace,
      `<article class="code-sandbox-document">${html}</article>`,
      language,
    ),
    diagnostics: [],
    durationMs: 0,
  };
}

function buildEjsEntry(workspace: WebWorkspace, entryPath: string, language: string): PreviewBuild {
  const entry = findFile(workspace, entryPath);

  if (!entry) {
    return {
      document: wrapDocument(workspace, "<p>Entry file not found.</p>", language),
      diagnostics: [],
      durationMs: 0,
    };
  }

  const dataFile = findFile(workspace, "data.json");
  let data: Record<string, unknown> = {};

  if (dataFile) {
    try {
      data = JSON.parse(dataFile.content) as Record<string, unknown>;
    } catch (error) {
      return {
        document: wrapDocument(workspace, "<p>data.json is not valid JSON.</p>", language),
        diagnostics: [
          {
            file: "data.json",
            line: 1,
            column: 1,
            message: error instanceof Error ? error.message : String(error),
            severity: "error",
          },
        ],
        durationMs: 0,
      };
    }
  }

  try {
    return {
      document: wrapDocument(workspace, renderEjs(entry.content, data), language),
      diagnostics: [],
      durationMs: 0,
    };
  } catch (error) {
    return {
      document: wrapDocument(workspace, "<p>Template error.</p>", language),
      diagnostics: [
        {
          file: entry.path,
          line: 1,
          column: 1,
          message: error instanceof Error ? error.message : String(error),
          severity: "error",
        },
      ],
      durationMs: 0,
    };
  }
}

export async function buildPreview(
  workspace: WebWorkspace,
  language = "en",
): Promise<PreviewBuild> {
  const extension = getExtension(workspace.entry);

  if (extension === ".md" || extension === ".markdown") {
    return buildMarkdownEntry(workspace, workspace.entry, language);
  }

  if (extension === ".ejs") {
    return buildEjsEntry(workspace, workspace.entry, language);
  }

  return buildHtmlEntry(workspace, workspace.entry);
}
