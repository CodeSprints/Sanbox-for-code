import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ExecutionError } from "@/features/code-runner/runner";
import type * as RunnerModule from "@/features/code-runner/runner";
import { useCodeRunnerStore } from "@/stores/code-runner";

const runCode = vi.hoisted(() => vi.fn());

vi.mock("@/features/code-runner/runner", async () => {
  const actual = await vi.importActual<typeof RunnerModule>("@/features/code-runner/runner");

  return { ...actual, runCode };
});

beforeEach(() => {
  setActivePinia(createPinia());
  runCode.mockReset();
});

describe("code runner store", () => {
  it("falls back to the starter source of the active language", () => {
    const store = useCodeRunnerStore();

    expect(store.source).toBe(store.language.starter);
    expect(store.status).toBe("idle");
  });

  it("keeps a separate source per language", () => {
    const store = useCodeRunnerStore();

    store.source = "print('python')";
    store.selectLanguage("go");

    expect(store.source).toBe(store.language.starter);

    store.selectLanguage("python");
    expect(store.source).toBe("print('python')");
  });

  it("marks a successful execution", async () => {
    runCode.mockResolvedValue({ output: "hello", failed: false, exitCode: 0, durationMs: 12 });
    const store = useCodeRunnerStore();

    await store.run();

    expect(store.status).toBe("succeeded");
    expect(store.output).toBe("hello");
    expect(store.lastResult?.durationMs).toBe(12);
  });

  it("marks a failing execution", async () => {
    runCode.mockResolvedValue({ output: "boom", failed: true, exitCode: 1, durationMs: 8 });
    const store = useCodeRunnerStore();

    await store.run();

    expect(store.status).toBe("failed");
  });

  it("exposes the error code of execution problems", async () => {
    runCode.mockRejectedValue(new ExecutionError("rate-limit", "slow down"));
    const store = useCodeRunnerStore();

    await store.run();

    expect(store.status).toBe("error");
    expect(store.errorCode).toBe("rate-limit");
  });

  it("reports unknown errors defensively", async () => {
    runCode.mockRejectedValue(new Error("unexpected"));
    const store = useCodeRunnerStore();

    await store.run();

    expect(store.errorCode).toBe("unknown");
  });

  it("resets the session", async () => {
    runCode.mockResolvedValue({ output: "hello", failed: false, exitCode: 0, durationMs: 1 });
    const store = useCodeRunnerStore();

    store.source = "print('x')";
    store.stdin = "data";
    await store.run();
    store.reset();

    expect(store.source).toBe(store.language.starter);
    expect(store.stdin).toBe("");
    expect(store.output).toBe("");
    expect(store.status).toBe("idle");
  });

  it("cancels a pending execution", async () => {
    runCode.mockImplementation(() => new Promise(() => {}));
    const store = useCodeRunnerStore();

    const pending = store.run();
    expect(store.isRunning).toBe(true);

    store.cancel();
    expect(store.status).toBe("cancelled");

    void pending;
  });

  it("toggles libraries per language and builds a manifest", () => {
    const store = useCodeRunnerStore();

    store.selectLanguage("python");
    expect(store.availableLibraries).toHaveLength(20);
    expect(store.manifest).toBeNull();

    const first = store.availableLibraries[0];
    store.toggleLibrary(first?.id ?? "");

    expect(store.activeLibraries.map((entry) => entry.id)).toEqual([first?.id]);
    expect(store.manifest?.path).toBe("requirements.txt");

    store.toggleLibrary(first?.id ?? "");
    expect(store.activeLibraries).toEqual([]);
  });

  it("keeps library selections separate per language", () => {
    const store = useCodeRunnerStore();

    store.selectLanguage("python");
    store.toggleLibrary("numpy");
    store.selectLanguage("rust");

    expect(store.activeLibraries).toEqual([]);

    store.selectLanguage("python");
    expect(store.activeLibraries.map((entry) => entry.id)).toEqual(["numpy"]);
  });

  it("inserts a library snippet only once", () => {
    const store = useCodeRunnerStore();

    store.selectLanguage("python");
    store.source = "print('hi')";
    store.insertSnippet("numpy");
    const inserted = store.source;

    expect(inserted.startsWith("import numpy as np")).toBe(true);

    store.insertSnippet("numpy");
    expect(store.source).toBe(inserted);
  });

  it("maps runtime output to editor diagnostics", async () => {
    runCode.mockResolvedValue({
      output: "File \"main.py\", line 3, in <module>\nNameError: name 'x' is not defined",
      failed: true,
      exitCode: 1,
      durationMs: 5,
    });
    const store = useCodeRunnerStore();

    store.selectLanguage("python");
    await store.run();

    expect(store.diagnostics[0]?.line).toBe(3);
    expect(store.diagnostics[0]?.severity).toBe("error");
  });

  it("sends the generated manifest with the run request", async () => {
    runCode.mockResolvedValue({ output: "", failed: false, exitCode: 0, durationMs: 1 });
    const store = useCodeRunnerStore();

    store.selectLanguage("python");
    store.toggleLibrary("numpy");
    await store.run();

    expect(runCode.mock.calls[0]?.[0]?.extraFiles).toEqual([
      { name: "requirements.txt", content: "numpy\n" },
    ]);
  });
});
