import { HighlightStyle, StreamLanguage, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags } from "@lezer/highlight";
import type { Extension } from "@codemirror/state";

import type { LanguageId } from "./registry";

export const syntaxHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--color-syntax-keyword)", fontWeight: "600" },
  { tag: tags.controlKeyword, color: "var(--color-syntax-keyword)", fontWeight: "600" },
  { tag: tags.moduleKeyword, color: "var(--color-syntax-keyword)", fontWeight: "600" },
  { tag: tags.definitionKeyword, color: "var(--color-syntax-keyword)", fontWeight: "600" },
  { tag: [tags.name, tags.deleted, tags.character], color: "var(--color-syntax-name)" },
  { tag: [tags.propertyName], color: "var(--color-syntax-property)" },
  { tag: [tags.variableName], color: "var(--color-syntax-variable)" },
  {
    tag: [tags.function(tags.variableName), tags.labelName],
    color: "var(--color-syntax-function)",
  },
  { tag: [tags.definition(tags.variableName)], color: "var(--color-syntax-variable)" },
  { tag: [tags.typeName, tags.className, tags.namespace], color: "var(--color-syntax-type)" },
  { tag: [tags.tagName], color: "var(--color-syntax-tag)", fontWeight: "600" },
  { tag: [tags.angleBracket], color: "var(--color-syntax-punctuation)" },
  { tag: [tags.attributeName], color: "var(--color-syntax-attribute)" },
  { tag: [tags.attributeValue], color: "var(--color-syntax-string)" },
  { tag: [tags.string, tags.special(tags.string)], color: "var(--color-syntax-string)" },
  { tag: [tags.number, tags.bool, tags.null, tags.atom], color: "var(--color-syntax-number)" },
  {
    tag: [tags.comment, tags.blockComment, tags.lineComment],
    color: "var(--color-syntax-comment)",
    fontStyle: "italic",
  },
  { tag: [tags.operator, tags.operatorKeyword], color: "var(--color-syntax-operator)" },
  {
    tag: [tags.punctuation, tags.separator, tags.bracket],
    color: "var(--color-syntax-punctuation)",
  },
  { tag: [tags.meta, tags.processingInstruction], color: "var(--color-syntax-meta)" },
  { tag: [tags.heading], color: "var(--color-syntax-heading)", fontWeight: "700" },
  { tag: [tags.strong], fontWeight: "700" },
  { tag: [tags.emphasis], fontStyle: "italic" },
  { tag: [tags.link, tags.url], color: "var(--color-syntax-link)", textDecoration: "underline" },
  { tag: [tags.invalid], color: "var(--color-danger)" },
]);

export const editorTheme: Extension = EditorView.theme({
  "&": {
    height: "100%",
    minHeight: "0",
    backgroundColor: "transparent",
    color: "var(--color-content)",
    fontSize: "0.8125rem",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
    lineHeight: "1.6",
    overflow: "auto",
  },
  ".cm-content": { caretColor: "var(--color-brand)", paddingBlock: "0.5rem" },
  ".cm-gutters": {
    backgroundColor: "var(--color-surface-sunken)",
    color: "var(--color-content-muted)",
    borderRight: "1px solid var(--color-line)",
  },
  ".cm-activeLine": { backgroundColor: "color-mix(in oklch, var(--color-brand) 10%, transparent)" },
  ".cm-activeLineGutter": {
    backgroundColor: "color-mix(in oklch, var(--color-brand) 14%, transparent)",
    color: "var(--color-content)",
  },
  "&.cm-focused": { outline: "3px solid var(--color-brand)", outlineOffset: "-3px" },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "color-mix(in oklch, var(--color-brand) 28%, transparent)",
  },
  "&.cm-focused .cm-selectionBackground": {
    backgroundColor: "color-mix(in oklch, var(--color-brand) 32%, transparent)",
  },
  ".cm-matchingBracket, .cm-nonmatchingBracket": {
    outline: "1px solid var(--color-content-muted)",
    backgroundColor: "transparent",
  },
  ".cm-lintRange-error": {
    backgroundImage: "none",
    textDecoration: "underline wavy var(--color-danger)",
    textUnderlineOffset: "3px",
  },
  ".cm-lintRange-warning": {
    backgroundImage: "none",
    textDecoration: "underline wavy var(--color-warning)",
    textUnderlineOffset: "3px",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--color-surface-raised)",
    border: "1px solid var(--color-line)",
    color: "var(--color-content)",
    borderRadius: "0.5rem",
  },
  ".cm-panels": {
    backgroundColor: "var(--color-surface-sunken)",
    color: "var(--color-content)",
  },
  ".cm-searchMatch": {
    backgroundColor: "color-mix(in oklch, var(--color-syntax-number) 35%, transparent)",
  },
});

export const highlighting: Extension = syntaxHighlighting(syntaxHighlightStyle, {
  fallback: true,
});

export async function loadLanguageExtension(id: LanguageId): Promise<Extension> {
  switch (id) {
    case "html": {
      const { html } = await import("@codemirror/lang-html");
      return html({ autoCloseTags: true, matchClosingTags: true });
    }
    case "ejs": {
      const { html } = await import("@codemirror/lang-html");
      return html({ autoCloseTags: false, matchClosingTags: true });
    }
    case "markdown": {
      const { markdown } = await import("@codemirror/lang-markdown");
      return markdown();
    }
    case "css": {
      const { css } = await import("@codemirror/lang-css");
      return css();
    }
    case "json": {
      const { json } = await import("@codemirror/lang-json");
      return json();
    }
    case "javascript": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript();
    }
    case "jsx": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ jsx: true });
    }
    case "typescript":
    case "declaration": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ typescript: true });
    }
    case "tsx": {
      const { javascript } = await import("@codemirror/lang-javascript");
      return javascript({ jsx: true, typescript: true });
    }
    case "vue": {
      const { vue } = await import("@codemirror/lang-vue");
      return vue();
    }
    case "svelte": {
      const { svelte } = await import("@replit/codemirror-lang-svelte");
      return svelte();
    }
    case "rust": {
      const { rust } = await import("@codemirror/lang-rust");
      return rust();
    }
    case "python": {
      const { python } = await import("@codemirror/lang-python");
      return python();
    }
    case "cpp": {
      const { cpp } = await import("@codemirror/lang-cpp");
      return cpp();
    }
    case "java": {
      const { java } = await import("@codemirror/lang-java");
      return java();
    }
    case "csharp": {
      const { csharp } = await import("@codemirror/legacy-modes/mode/clike");
      return StreamLanguage.define(csharp);
    }
    case "kotlin": {
      const { kotlin } = await import("@codemirror/legacy-modes/mode/clike");
      return StreamLanguage.define(kotlin);
    }
    case "shell": {
      const { shell } = await import("@codemirror/legacy-modes/mode/shell");
      return StreamLanguage.define(shell);
    }
    default:
      return [];
  }
}
