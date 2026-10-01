import { detectLanguage, type LanguageDefinition } from "@/features/languages/registry";

export interface WorkspaceFile {
  path: string;
  content: string;
}

export interface WebWorkspace {
  templateId: string;
  entry: string;
  files: WorkspaceFile[];
  dependencies: Record<string, string>;
  uiLibrary: UiLibrary;
}

export const UI_LIBRARIES = [
  "none",
  "tailwind",
  "bootstrap",
  "bulma",
  "pico",
  "water",
  "fontawesome",
  "animate",
] as const;

export type UiLibrary = (typeof UI_LIBRARIES)[number];

export function normalizePath(path: string): string {
  return path
    .trim()
    .replace(/^\.\//, "")
    .replace(/^\/+/, "")
    .replace(/\\/g, "/")
    .replace(/\/{2,}/g, "/");
}

export function fileLanguage(file: WorkspaceFile): LanguageDefinition {
  return detectLanguage(file.path);
}

export function findFile(workspace: WebWorkspace, path: string): WorkspaceFile | undefined {
  const normalized = normalizePath(path);

  return workspace.files.find((file) => file.path === normalized);
}

export function sortFiles(files: readonly WorkspaceFile[]): WorkspaceFile[] {
  return [...files].sort((a, b) => a.path.localeCompare(b.path, "en"));
}

export function uniquePath(workspace: WebWorkspace, desired: string): string {
  const normalized = normalizePath(desired);

  if (!findFile(workspace, normalized)) {
    return normalized;
  }

  const dot = normalized.lastIndexOf(".");
  const base = dot === -1 ? normalized : normalized.slice(0, dot);
  const extension = dot === -1 ? "" : normalized.slice(dot);

  let counter = 2;

  while (findFile(workspace, `${base}-${counter}${extension}`)) {
    counter += 1;
  }

  return `${base}-${counter}${extension}`;
}

export function upsertFile(workspace: WebWorkspace, path: string, content: string): WebWorkspace {
  const normalized = normalizePath(path);
  const exists = Boolean(findFile(workspace, normalized));
  const files = exists
    ? workspace.files.map((file) => (file.path === normalized ? { ...file, content } : file))
    : sortFiles([...workspace.files, { path: normalized, content }]);

  return { ...workspace, files };
}

export function removeFile(workspace: WebWorkspace, path: string): WebWorkspace {
  const normalized = normalizePath(path);

  if (workspace.files.length <= 1 || normalized === workspace.entry) {
    return workspace;
  }

  return { ...workspace, files: workspace.files.filter((file) => file.path !== normalized) };
}

export function renameFile(workspace: WebWorkspace, from: string, to: string): WebWorkspace {
  const source = normalizePath(from);
  const target = normalizePath(to);

  if (source === target || !findFile(workspace, source) || findFile(workspace, target)) {
    return workspace;
  }

  return {
    ...workspace,
    entry: workspace.entry === source ? target : workspace.entry,
    files: sortFiles(
      workspace.files.map((file) => (file.path === source ? { ...file, path: target } : file)),
    ),
  };
}

export function setDependency(
  workspace: WebWorkspace,
  name: string,
  version: string,
): WebWorkspace {
  return { ...workspace, dependencies: { ...workspace.dependencies, [name]: version } };
}

export function removeDependency(workspace: WebWorkspace, name: string): WebWorkspace {
  const dependencies = { ...workspace.dependencies };
  delete dependencies[name];

  return { ...workspace, dependencies };
}

const BARE_IMPORT_PATTERN =
  /(?:import|export)[\s\S]*?from\s*["']([^"'./][^"']*)["']|import\s*\(\s*["']([^"'./][^"']*)["']\s*\)|require\(\s*["']([^"'./][^"']*)["']\s*\)/g;

export function packageNameOf(specifier: string): string {
  const parts = specifier.split("/");

  if (specifier.startsWith("@") && parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }

  return parts[0] ?? specifier;
}

export function collectBareImports(workspace: WebWorkspace): string[] {
  const found = new Set<string>();

  for (const file of workspace.files) {
    const language = fileLanguage(file);

    if (language.group !== "script") {
      continue;
    }

    for (const match of file.content.matchAll(BARE_IMPORT_PATTERN)) {
      const specifier = match[1] ?? match[2] ?? match[3];

      if (specifier) {
        found.add(packageNameOf(specifier));
      }
    }
  }

  return [...found].sort((a, b) => a.localeCompare(b, "en"));
}

export function missingDependencies(workspace: WebWorkspace): string[] {
  return collectBareImports(workspace).filter((name) => !(name in workspace.dependencies));
}
