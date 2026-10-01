import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";

import CodeMirrorEditor from "@/components/CodeMirrorEditor.vue";

function mountEditor(props: Record<string, unknown> = {}) {
  return mount(CodeMirrorEditor, {
    props: {
      modelValue: "const value = 1;\nconsole.log(value);",
      language: "typescript",
      ariaLabelText: "Source editor",
      ...props,
    },
    attachTo: document.body,
  });
}

describe("CodeMirrorEditor", () => {
  it("renders the document with line numbers", () => {
    const wrapper = mountEditor();

    expect(wrapper.get(".cm-content").text()).toContain("const value = 1;");
    expect(wrapper.findAll(".cm-gutterElement").length).toBeGreaterThan(1);
  });

  it("labels the editable region for assistive technology", () => {
    const wrapper = mountEditor();

    expect(wrapper.get(".cm-content").attributes("aria-label")).toBe("Source editor");
    expect(wrapper.get(".cm-content").attributes("spellcheck")).toBe("false");
  });

  it("keeps the view in sync with the model value", async () => {
    const wrapper = mountEditor();

    await wrapper.setProps({ modelValue: "const other = 2;" });
    await nextTick();

    expect(wrapper.get(".cm-content").text()).toContain("const other = 2;");
  });

  it("emits updates when the document changes", async () => {
    const wrapper = mountEditor();
    const view = (wrapper.vm as unknown as { view?: { dispatch: (spec: unknown) => void } }).view;

    view?.dispatch({ changes: { from: 0, to: 0, insert: "// " } });
    await nextTick();

    expect(wrapper.emitted("update:modelValue")?.at(-1)?.[0]).toContain("// const value = 1;");
  });

  it("renders external diagnostics as lint markers", async () => {
    const wrapper = mountEditor({
      diagnostics: [
        { line: 1, column: 1, message: "Unexpected token", severity: "error", source: "build" },
      ],
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 1200);
    });

    expect(wrapper.html()).toContain("cm-lint");
  });

  it("supports a read only mode", () => {
    const wrapper = mountEditor({ readOnly: true });

    expect(wrapper.get(".cm-content").attributes("contenteditable")).toBe("false");
  });
});
