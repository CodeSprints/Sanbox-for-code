import type { FileDiagnostic } from "@/features/languages/diagnostics";

interface PatternDescriptor {
  pattern: RegExp;
  file: number;
  line: number;
  column?: number;
  message: number;
  severity?: number;
}

const PATTERNS: readonly PatternDescriptor[] = [
  {
    pattern: /^(.+?):(\d+):(\d+):\s*(fatal error|error|warning):\s*(.*)$/gim,
    file: 1,
    line: 2,
    column: 3,
    severity: 4,
    message: 5,
  },
  {
    pattern: /^(.+?)\((\d+),(\d+)\):\s*(error|warning)\s*[A-Z]+\d+:\s*(.*)$/gim,
    file: 1,
    line: 2,
    column: 3,
    severity: 4,
    message: 5,
  },
  {
    pattern: /^(.+?):(\d+):\s*(error|warning):\s*(.*)$/gim,
    file: 1,
    line: 2,
    severity: 3,
    message: 4,
  },
  { pattern: /^\s*-->\s*(.+?):(\d+):(\d+)\s*$/gim, file: 1, line: 2, column: 3, message: 0 },
  { pattern: /File "(.+?)", line (\d+)/gim, file: 1, line: 2, message: 0 },
  {
    pattern: /^(.+?):(\d+):(\d+)\s*-\s*(error|warning)\s*TS\d+:\s*(.*)$/gim,
    file: 1,
    line: 2,
    column: 3,
    severity: 4,
    message: 5,
  },
];

const MAX_DIAGNOSTICS = 50;

function normalizeSeverity(value: string | undefined): FileDiagnostic["severity"] {
  if (!value) {
    return "error";
  }

  return value.toLowerCase().includes("warning") ? "warning" : "error";
}

function baseName(path: string): string {
  return path.replace(/^\.\//, "").split("/").at(-1) ?? path;
}

function contextMessage(output: string, index: number, fallback: string): string {
  const after = output.slice(index);
  const lines = after.split("\n").slice(0, 4);
  const detail = lines.find((line) => /error|warning|Error|exception/i.test(line));

  return (detail ?? fallback).trim().slice(0, 300);
}

export function parseOutputDiagnostics(
  output: string,
  knownFiles: readonly string[],
): FileDiagnostic[] {
  const diagnostics: FileDiagnostic[] = [];
  const seen = new Set<string>();
  const names = new Map(knownFiles.map((file) => [baseName(file).toLowerCase(), file]));

  for (const descriptor of PATTERNS) {
    descriptor.pattern.lastIndex = 0;

    for (const match of output.matchAll(descriptor.pattern)) {
      if (diagnostics.length >= MAX_DIAGNOSTICS) {
        break;
      }

      const rawFile = match[descriptor.file] ?? "";
      const resolved = names.get(baseName(rawFile).toLowerCase());

      if (!resolved) {
        continue;
      }

      const line = Number(match[descriptor.line] ?? 1);

      if (!Number.isFinite(line) || line < 1) {
        continue;
      }

      const column = descriptor.column ? Number(match[descriptor.column] ?? 1) : 1;
      const explicitMessage = descriptor.message > 0 ? (match[descriptor.message] ?? "") : "";
      const message =
        explicitMessage.length > 0
          ? explicitMessage.trim()
          : contextMessage(output, (match.index ?? 0) + match[0].length, match[0]);
      const key = `${resolved}:${line}:${column}:${message}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      diagnostics.push({
        line,
        column: Number.isFinite(column) && column > 0 ? column : 1,
        message,
        severity: normalizeSeverity(descriptor.severity ? match[descriptor.severity] : undefined),
        source: "runtime",
      });
    }
  }

  return diagnostics;
}
