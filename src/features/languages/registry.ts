export type LanguageId =
  | "html"
  | "ejs"
  | "markdown"
  | "css"
  | "json"
  | "javascript"
  | "jsx"
  | "typescript"
  | "tsx"
  | "declaration"
  | "vue"
  | "svelte"
  | "rust"
  | "python"
  | "cpp"
  | "csharp"
  | "java"
  | "kotlin"
  | "shell"
  | "plain";

export type LanguageGroup = "markup" | "style" | "script" | "data" | "program";

export interface LanguageDefinition {
  id: LanguageId;
  label: string;
  group: LanguageGroup;
  extensions: readonly string[];
  commentPrefix: string;
  runnableId?: string;
}

export const LANGUAGE_DEFINITIONS: readonly LanguageDefinition[] = [
  {
    id: "html",
    label: "HTML",
    group: "markup",
    extensions: [".html", ".htm"],
    commentPrefix: "<!--",
  },
  { id: "ejs", label: "EJS", group: "markup", extensions: [".ejs"], commentPrefix: "<%#" },
  {
    id: "markdown",
    label: "Markdown",
    group: "markup",
    extensions: [".md", ".markdown"],
    commentPrefix: "<!--",
  },
  { id: "css", label: "CSS", group: "style", extensions: [".css"], commentPrefix: "/*" },
  { id: "json", label: "JSON", group: "data", extensions: [".json"], commentPrefix: "" },
  {
    id: "javascript",
    label: "JavaScript",
    group: "script",
    extensions: [".js", ".mjs", ".cjs"],
    commentPrefix: "//",
    runnableId: "javascript",
  },
  {
    id: "jsx",
    label: "JavaScript React",
    group: "script",
    extensions: [".jsx"],
    commentPrefix: "//",
  },
  {
    id: "declaration",
    label: "TypeScript declarations",
    group: "script",
    extensions: [".d.ts"],
    commentPrefix: "//",
  },
  {
    id: "typescript",
    label: "TypeScript",
    group: "script",
    extensions: [".ts", ".mts", ".cts"],
    commentPrefix: "//",
    runnableId: "typescript",
  },
  {
    id: "tsx",
    label: "TypeScript React",
    group: "script",
    extensions: [".tsx"],
    commentPrefix: "//",
  },
  { id: "vue", label: "Vue SFC", group: "script", extensions: [".vue"], commentPrefix: "<!--" },
  {
    id: "svelte",
    label: "Svelte",
    group: "script",
    extensions: [".svelte"],
    commentPrefix: "<!--",
  },
  {
    id: "rust",
    label: "Rust",
    group: "program",
    extensions: [".rs"],
    commentPrefix: "//",
    runnableId: "rust",
  },
  {
    id: "python",
    label: "Python",
    group: "program",
    extensions: [".py"],
    commentPrefix: "#",
    runnableId: "python",
  },
  {
    id: "cpp",
    label: "C++",
    group: "program",
    extensions: [".cpp", ".cc", ".cxx", ".hpp", ".h", ".c"],
    commentPrefix: "//",
    runnableId: "cpp",
  },
  {
    id: "csharp",
    label: "C#",
    group: "program",
    extensions: [".cs"],
    commentPrefix: "//",
    runnableId: "csharp",
  },
  {
    id: "java",
    label: "Java",
    group: "program",
    extensions: [".java"],
    commentPrefix: "//",
    runnableId: "java",
  },
  {
    id: "kotlin",
    label: "Kotlin",
    group: "program",
    extensions: [".kt", ".kts"],
    commentPrefix: "//",
    runnableId: "kotlin",
  },
  {
    id: "shell",
    label: "Shell",
    group: "program",
    extensions: [".sh", ".bash"],
    commentPrefix: "#",
    runnableId: "bash",
  },
  { id: "plain", label: "Plain text", group: "data", extensions: [".txt"], commentPrefix: "" },
];

const DEFINITIONS_BY_ID = new Map<LanguageId, LanguageDefinition>(
  LANGUAGE_DEFINITIONS.map((definition) => [definition.id, definition]),
);

export function getExtension(path: string): string {
  const name = path.slice(path.lastIndexOf("/") + 1).toLowerCase();

  if (name.endsWith(".d.ts")) {
    return ".d.ts";
  }

  const dot = name.lastIndexOf(".");

  return dot === -1 ? "" : name.slice(dot);
}

export function detectLanguage(path: string): LanguageDefinition {
  const extension = getExtension(path);
  const match = LANGUAGE_DEFINITIONS.find((definition) =>
    definition.extensions.includes(extension),
  );

  return match ?? (DEFINITIONS_BY_ID.get("plain") as LanguageDefinition);
}

export function getLanguage(id: LanguageId): LanguageDefinition {
  return DEFINITIONS_BY_ID.get(id) ?? (DEFINITIONS_BY_ID.get("plain") as LanguageDefinition);
}

export const SUPPORTED_EXTENSIONS: readonly string[] = LANGUAGE_DEFINITIONS.flatMap(
  (definition) => definition.extensions,
);

export function isSupportedExtension(path: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(getExtension(path));
}
