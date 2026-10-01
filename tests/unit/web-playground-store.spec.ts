import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

import { isPreviewMessage } from "@/features/web-playground/preview-message";
import { DEVICE_SIZES, useWebPlaygroundStore } from "@/stores/web-playground";

const buildPreview = vi.hoisted(() => vi.fn());

vi.mock("@/features/web-playground/document-builder", () => ({ buildPreview }));

beforeEach(() => {
  setActivePinia(createPinia());
  buildPreview.mockReset();
  buildPreview.mockResolvedValue({ document: "<html></html>", diagnostics: [], durationMs: 3 });
});

describe("web playground store", () => {
  it("starts from the default workspace", () => {
    const store = useWebPlaygroundStore();

    expect(store.workspace.templateId).toBe("vanilla");
    expect(store.activePath).toBe(store.workspace.entry);
    expect(store.activeFile?.path).toBe(store.workspace.entry);
  });

  it("builds the preview document on demand", async () => {
    const store = useWebPlaygroundStore();

    await store.refresh();

    expect(store.document).toBe("<html></html>");
    expect(store.buildDurationMs).toBe(3);
    expect(store.lastBuiltAt).toBeGreaterThan(0);
    expect(store.building).toBe(false);
  });

  it("exposes error and warning counts from diagnostics", async () => {
    buildPreview.mockResolvedValue({
      document: "",
      durationMs: 1,
      diagnostics: [
        { file: "main.js", line: 2, column: 1, message: "bad", severity: "error" },
        { file: "main.js", line: 4, column: 1, message: "meh", severity: "warning" },
      ],
    });
    const store = useWebPlaygroundStore();

    await store.refresh();

    expect(store.errorCount).toBe(1);
    expect(store.warningCount).toBe(1);
    expect(store.diagnosticsFor("main.js")).toHaveLength(2);
    expect(store.diagnosticsFor("other.js")).toEqual([]);
  });

  it("edits the active file", () => {
    const store = useWebPlaygroundStore();

    store.updateActiveFile("<p>edited</p>");

    expect(store.activeFile?.content).toBe("<p>edited</p>");
  });

  it("adds, renames and deletes files", () => {
    const store = useWebPlaygroundStore();

    const added = store.addFile("helper.ts", "export const x = 1;");

    expect(added).toBe("helper.ts");
    expect(store.activePath).toBe("helper.ts");

    const duplicate = store.addFile("helper.ts");

    expect(duplicate).toBe("helper-2.ts");

    store.rename("helper.ts", "util.ts");

    expect(store.activePath).toBe("util.ts");

    store.deleteFile("util.ts");

    expect(store.workspace.files.some((file) => file.path === "util.ts")).toBe(false);
    expect(store.activePath).toBe(store.workspace.entry);
  });

  it("changes the entry file", () => {
    const store = useWebPlaygroundStore();

    store.addFile("page.html", "<html></html>");
    store.setEntry("page.html");

    expect(store.workspace.entry).toBe("page.html");
  });

  it("manages dependencies and reports unresolved imports", () => {
    const store = useWebPlaygroundStore();

    store.addFile("app.ts", 'import confetti from "canvas-confetti";\nconsole.log(confetti);');

    expect(store.unresolvedDependencies).toEqual(["canvas-confetti"]);

    store.addDependency("canvas-confetti", "1.9.3");

    expect(store.unresolvedDependencies).toEqual([]);
    expect(store.workspace.dependencies).toEqual({ "canvas-confetti": "1.9.3" });

    store.dropDependency("canvas-confetti");

    expect(store.workspace.dependencies).toEqual({});
  });

  it("switches the ui library", () => {
    const store = useWebPlaygroundStore();

    store.setUiLibrary("tailwind");

    expect(store.workspace.uiLibrary).toBe("tailwind");
  });

  it("applies a template and clears the console", () => {
    const store = useWebPlaygroundStore();

    store.pushConsoleEntry("log", "old");
    store.applyTemplate("react");

    expect(store.workspace.templateId).toBe("react");
    expect(store.activePath).toBe(store.workspace.entry);
    expect(store.consoleEntries).toEqual([]);
  });

  it("resets to the current template", () => {
    const store = useWebPlaygroundStore();

    store.applyTemplate("markdown");
    store.updateActiveFile("changed");
    store.reset();

    expect(store.workspace.templateId).toBe("markdown");
    expect(store.activeFile?.content).not.toBe("changed");
  });

  it("collects console entries and clears them", () => {
    const store = useWebPlaygroundStore();

    store.pushConsoleEntry("log", "hello", 10);
    store.pushConsoleEntry("error", "boom", 20);

    expect(store.consoleEntries).toHaveLength(2);
    expect(store.consoleErrorCount).toBe(1);
    expect(store.consoleEntries[0]).toMatchObject({ level: "log", message: "hello", time: 10 });

    store.clearConsole();

    expect(store.consoleEntries).toEqual([]);
  });

  it("caps the console history", () => {
    const store = useWebPlaygroundStore();

    for (let index = 0; index < 220; index += 1) {
      store.pushConsoleEntry("log", `entry ${index}`);
    }

    expect(store.consoleEntries).toHaveLength(200);
    expect(store.consoleEntries.at(-1)?.message).toBe("entry 219");
  });

  it("rebuilds automatically after an edit when auto run is on", async () => {
    vi.useFakeTimers();
    const store = useWebPlaygroundStore();

    store.updateActiveFile("<p>auto</p>");
    await nextTick();
    await vi.advanceTimersByTimeAsync(600);

    expect(buildPreview).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("does not rebuild automatically when auto run is off", async () => {
    vi.useFakeTimers();
    const store = useWebPlaygroundStore();

    store.setAutoRun(false);
    buildPreview.mockClear();
    store.updateActiveFile("<p>manual</p>");
    await nextTick();
    await vi.advanceTimersByTimeAsync(600);

    expect(buildPreview).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("keeps device presets with known sizes", () => {
    const store = useWebPlaygroundStore();

    expect(store.devicePreset).toBe("responsive");

    store.setDevicePreset("mobile");

    expect(store.devicePreset).toBe("mobile");
    expect(DEVICE_SIZES.mobile).toEqual({ width: 390, height: 844 });
    expect(DEVICE_SIZES.responsive).toBeNull();
  });
});

describe("isPreviewMessage", () => {
  it("accepts bridge messages", () => {
    expect(
      isPreviewMessage({ source: "code-sandbox-preview", level: "warn", message: "x", time: 1 }),
    ).toBe(true);
  });

  it("rejects anything else", () => {
    expect(isPreviewMessage(null)).toBe(false);
    expect(isPreviewMessage({ source: "other", level: "log", message: "x", time: 1 })).toBe(false);
    expect(isPreviewMessage({ source: "code-sandbox-preview", level: "trace", message: "x" })).toBe(
      false,
    );
  });
});
