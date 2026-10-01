import { createPinia, setActivePinia } from "pinia";
import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import FileExplorer from "@/components/FileExplorer.vue";
import { setLocale } from "@/i18n";
import { useWebPlaygroundStore } from "@/stores/web-playground";

vi.mock("@/features/web-playground/document-builder", () => ({
  buildPreview: vi.fn(async () => ({ document: "", diagnostics: [], durationMs: 0 })),
}));

beforeEach(() => {
  setActivePinia(createPinia());
  setLocale("en");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("FileExplorer", () => {
  it("lists workspace files and marks the entry", () => {
    const store = useWebPlaygroundStore();
    const wrapper = mount(FileExplorer);

    expect(wrapper.findAll("li")).toHaveLength(store.workspace.files.length);
    expect(wrapper.text()).toContain("entry");
  });

  it("selects a file on click", async () => {
    const store = useWebPlaygroundStore();
    const wrapper = mount(FileExplorer);
    const target = store.workspace.files[1]?.path ?? "";

    await wrapper
      .findAll("li button")
      .find((button) => button.text().includes(target))
      ?.trigger("click");

    expect(store.activePath).toBe(target);
  });

  it("adds a file from the prompt value", async () => {
    vi.stubGlobal(
      "prompt",
      vi.fn(() => "widget.ts"),
    );
    const store = useWebPlaygroundStore();
    const wrapper = mount(FileExplorer);

    await wrapper
      .findAll("button")
      .find((button) => button.text() === "New file")
      ?.trigger("click");

    expect(store.workspace.files.some((file) => file.path === "widget.ts")).toBe(true);
  });

  it("ignores an empty prompt", async () => {
    vi.stubGlobal(
      "prompt",
      vi.fn(() => ""),
    );
    const store = useWebPlaygroundStore();
    const before = store.workspace.files.length;
    const wrapper = mount(FileExplorer);

    await wrapper
      .findAll("button")
      .find((button) => button.text() === "New file")
      ?.trigger("click");

    expect(store.workspace.files).toHaveLength(before);
  });

  it("changes the entry file from the action menu", async () => {
    const store = useWebPlaygroundStore();
    const wrapper = mount(FileExplorer);
    const index = store.workspace.files.findIndex((file) => file.path !== store.workspace.entry);

    await wrapper.findAll("details")[index]?.findAll("button")[1]?.trigger("click");

    expect(store.workspace.entry).toBe(store.workspace.files[index]?.path);
  });

  it("disables deleting the entry file", () => {
    const store = useWebPlaygroundStore();
    const wrapper = mount(FileExplorer);
    const index = store.workspace.files.findIndex((file) => file.path === store.workspace.entry);
    const remove = wrapper.findAll("details")[index]?.findAll("button")[2];

    expect(remove?.attributes("disabled")).toBeDefined();
  });

  it("shows the error count of a file", async () => {
    const store = useWebPlaygroundStore();
    store.diagnostics = [
      {
        file: store.workspace.entry,
        line: 1,
        column: 1,
        message: "bad",
        severity: "error",
      },
    ];
    const wrapper = mount(FileExplorer);

    expect(wrapper.get("li").text()).toContain("1");
  });
});
