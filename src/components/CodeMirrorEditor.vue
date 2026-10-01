<script setup lang="ts">
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentMore,
  indentLess,
} from "@codemirror/commands";
import { bracketMatching, foldGutter, indentOnInput, indentUnit } from "@codemirror/language";
import { lintGutter } from "@codemirror/lint";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { Compartment, EditorState } from "@codemirror/state";
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  placeholder as placeholderExtension,
} from "@codemirror/view";
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";

import {
  createLinters,
  setExternalDiagnostics,
  type FileDiagnostic,
} from "@/features/languages/diagnostics";
import { editorTheme, highlighting, loadLanguageExtension } from "@/features/languages/codemirror";
import type { LanguageId } from "@/features/languages/registry";

const props = withDefaults(
  defineProps<{
    language: LanguageId;
    ariaLabelText: string;
    diagnostics?: readonly FileDiagnostic[];
    placeholder?: string;
    readOnly?: boolean;
  }>(),
  { diagnostics: () => [], placeholder: "", readOnly: false },
);

const model = defineModel<string>({ required: true });

const host = ref<HTMLDivElement | null>(null);
const view = shallowRef<EditorView | null>(null);
const languageCompartment = new Compartment();
const lintCompartment = new Compartment();
const tabIndents = ref(true);

function baseExtensions() {
  return [
    lineNumbers(),
    highlightActiveLineGutter(),
    highlightActiveLine(),
    highlightSpecialChars(),
    highlightSelectionMatches(),
    history(),
    foldGutter(),
    lintGutter(),
    bracketMatching(),
    closeBrackets(),
    indentOnInput(),
    indentUnit.of("  "),
    autocompletion(),
    EditorState.allowMultipleSelections.of(true),
    EditorView.lineWrapping,
    EditorView.editable.of(!props.readOnly),
    EditorState.readOnly.of(props.readOnly),
    EditorView.contentAttributes.of({
      "aria-label": props.ariaLabelText,
      "data-gramm": "false",
      autocorrect: "off",
      autocapitalize: "off",
      spellcheck: "false",
    }),
    placeholderExtension(props.placeholder),
    keymap.of([
      {
        key: "Tab",
        run: (target) => (tabIndents.value ? indentMore(target) : false),
        shift: (target) => (tabIndents.value ? indentLess(target) : false),
      },
      {
        key: "Escape",
        run: () => {
          tabIndents.value = false;
          return false;
        },
      },
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...searchKeymap,
      ...historyKeymap,
      ...completionKeymap,
    ]),
    editorTheme,
    highlighting,
    EditorView.updateListener.of((update) => {
      if (!update.docChanged) {
        return;
      }

      const next = update.state.doc.toString();

      if (next !== model.value) {
        model.value = next;
      }
    }),
    EditorView.domEventHandlers({
      focus: () => {
        tabIndents.value = true;
        return false;
      },
    }),
  ];
}

async function applyLanguage(id: LanguageId): Promise<void> {
  const extension = await loadLanguageExtension(id);

  view.value?.dispatch({
    effects: [
      languageCompartment.reconfigure(extension),
      lintCompartment.reconfigure(createLinters(id === "json")),
    ],
  });
}

function applyDiagnostics(diagnostics: readonly FileDiagnostic[]): void {
  view.value?.dispatch({ effects: setExternalDiagnostics.of(diagnostics) });
}

onMounted(async () => {
  if (!host.value) {
    return;
  }

  view.value = new EditorView({
    parent: host.value,
    state: EditorState.create({
      doc: model.value,
      extensions: [
        ...baseExtensions(),
        languageCompartment.of([]),
        lintCompartment.of(createLinters(props.language === "json")),
      ],
    }),
  });

  await applyLanguage(props.language);
  applyDiagnostics(props.diagnostics);
});

onBeforeUnmount(() => {
  view.value?.destroy();
  view.value = null;
});

watch(
  () => props.language,
  (id) => {
    void applyLanguage(id);
  },
);

watch(
  () => props.diagnostics,
  (diagnostics) => applyDiagnostics(diagnostics),
  { deep: true },
);

watch(model, (value) => {
  const current = view.value?.state.doc.toString();

  if (view.value && current !== value) {
    view.value.dispatch({
      changes: { from: 0, to: view.value.state.doc.length, insert: value },
    });
  }
});

defineExpose({
  focus: () => view.value?.focus(),
});
</script>

<template>
  <div ref="host" class="min-h-0 flex-1 overflow-hidden" />
</template>
