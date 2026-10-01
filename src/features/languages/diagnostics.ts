import { syntaxTree } from "@codemirror/language";
import { linter, type Diagnostic } from "@codemirror/lint";
import { StateEffect, StateField } from "@codemirror/state";
import type { EditorState, Extension } from "@codemirror/state";

export interface FileDiagnostic {
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  message: string;
  severity: "error" | "warning" | "info";
  source: string;
}

const MAX_SYNTAX_ERRORS = 30;

function positionAt(state: EditorState, line: number, column: number): number {
  const safeLine = Math.min(Math.max(line, 1), state.doc.lines);
  const lineInfo = state.doc.line(safeLine);
  const offset = Math.min(Math.max(column - 1, 0), lineInfo.length);

  return lineInfo.from + offset;
}

export function toEditorDiagnostics(
  state: EditorState,
  diagnostics: readonly FileDiagnostic[],
): Diagnostic[] {
  return diagnostics.map((diagnostic) => {
    const from = positionAt(state, diagnostic.line, diagnostic.column);
    const to = positionAt(
      state,
      diagnostic.endLine ?? diagnostic.line,
      diagnostic.endColumn ?? diagnostic.column + 1,
    );

    return {
      from,
      to: Math.max(to, from + 1),
      severity: diagnostic.severity,
      message: diagnostic.message,
      source: diagnostic.source,
    };
  });
}

export const setExternalDiagnostics = StateEffect.define<readonly FileDiagnostic[]>();

export const externalDiagnosticsField = StateField.define<readonly FileDiagnostic[]>({
  create: () => [],
  update(value, transaction) {
    for (const effect of transaction.effects) {
      if (effect.is(setExternalDiagnostics)) {
        return effect.value;
      }
    }

    return value;
  },
});

export function countSyntaxErrors(state: EditorState): number {
  let total = 0;

  syntaxTree(state).iterate({
    enter(node) {
      if (node.type.isError) {
        total += 1;
      }
    },
  });

  return total;
}

function syntaxDiagnosticSource(state: EditorState): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  const tree = syntaxTree(state);

  if (tree.length < state.doc.length) {
    return diagnostics;
  }

  tree.iterate({
    enter(node) {
      if (!node.type.isError || diagnostics.length >= MAX_SYNTAX_ERRORS) {
        return;
      }

      const from = node.from;
      const to = Math.min(Math.max(node.to, node.from + 1), state.doc.length);
      const previous = diagnostics.at(-1);

      if (previous && from - previous.to <= 1) {
        previous.to = to;
        return;
      }

      diagnostics.push({
        from,
        to,
        severity: "error",
        source: "syntax",
        message: `Syntax error near "${state.doc.sliceString(from, Math.min(to, from + 24))}"`,
      });
    },
  });

  return diagnostics;
}

function jsonDiagnosticSource(state: EditorState): Diagnostic[] {
  const text = state.doc.toString();

  if (text.trim().length === 0) {
    return [];
  }

  try {
    JSON.parse(text);
    return [];
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const positionMatch = /position (\d+)/.exec(message);
    const from = positionMatch ? Math.min(Number(positionMatch[1]), state.doc.length - 1) : 0;

    return [
      {
        from: Math.max(from, 0),
        to: Math.min(from + 1, state.doc.length),
        severity: "error",
        source: "json",
        message,
      },
    ];
  }
}

export function createLinters(isJson: boolean): Extension {
  const sources = [linter((view) => syntaxDiagnosticSource(view.state), { delay: 400 })];

  if (isJson) {
    sources.push(linter((view) => jsonDiagnosticSource(view.state), { delay: 400 }));
  }

  sources.push(
    linter((view) => toEditorDiagnostics(view.state, view.state.field(externalDiagnosticsField)), {
      delay: 150,
    }),
  );

  return [externalDiagnosticsField, sources];
}
