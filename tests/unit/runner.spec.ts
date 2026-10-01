import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_LANGUAGE,
  findLanguage,
  RUNNABLE_LANGUAGES,
} from "@/features/code-runner/languages";
import { ExecutionError, runCode } from "@/features/code-runner/runner";

function mockFetch(response: unknown, init: { status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(response), {
      status: init.status ?? 200,
      headers: { "Content-Type": "application/json" },
    }),
  );

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("language catalog", () => {
  it("exposes unique language identifiers", () => {
    const ids = RUNNABLE_LANGUAGES.map((language) => language.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("falls back to the default language for unknown identifiers", () => {
    expect(findLanguage("brainfuck")).toBe(DEFAULT_LANGUAGE);
  });
});

describe("runCode", () => {
  it("sends the piston payload expected by the service", async () => {
    const fetchMock = mockFetch({ run: { stdout: "hi", code: 0 } });

    await runCode({ language: DEFAULT_LANGUAGE, source: "print(1)", stdin: "input" });

    const [, requestInit] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(requestInit.body)) as Record<string, unknown>;

    expect(body.language).toBe(DEFAULT_LANGUAGE.runtime);
    expect(body.version).toBe(DEFAULT_LANGUAGE.version);
    expect(body.stdin).toBe("input");
    expect(body.files).toEqual([{ name: DEFAULT_LANGUAGE.filename, content: "print(1)" }]);
  });

  it("returns a successful result", async () => {
    mockFetch({ run: { stdout: "hello", stderr: "", code: 0 } });

    const result = await runCode({ language: DEFAULT_LANGUAGE, source: "print(1)", stdin: "" });

    expect(result.output).toBe("hello");
    expect(result.failed).toBe(false);
    expect(result.exitCode).toBe(0);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("marks non zero exit codes as failures", async () => {
    mockFetch({ run: { stdout: "", stderr: "boom", code: 1 } });

    const result = await runCode({ language: DEFAULT_LANGUAGE, source: "print(1)", stdin: "" });

    expect(result.failed).toBe(true);
    expect(result.output).toContain("boom");
  });

  it("merges compile and run output", async () => {
    mockFetch({ compile: { stderr: "warning", code: 0 }, run: { stdout: "done", code: 0 } });

    const result = await runCode({
      language: findLanguage("cpp"),
      source: "int main(){}",
      stdin: "",
    });

    expect(result.output).toBe("warning\ndone");
  });

  it("rejects empty sources without calling the service", async () => {
    const fetchMock = mockFetch({});

    await expect(
      runCode({ language: DEFAULT_LANGUAGE, source: "   ", stdin: "" }),
    ).rejects.toMatchObject({ code: "empty-source" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps rate limiting to a dedicated error code", async () => {
    mockFetch({}, { status: 429 });

    await expect(
      runCode({ language: DEFAULT_LANGUAGE, source: "print(1)", stdin: "" }),
    ).rejects.toMatchObject({ code: "rate-limit" });
  });

  it("maps service failures", async () => {
    mockFetch({}, { status: 500 });

    await expect(
      runCode({ language: DEFAULT_LANGUAGE, source: "print(1)", stdin: "" }),
    ).rejects.toMatchObject({ code: "service" });
  });

  it("maps transport failures to network errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));

    const error = await runCode({
      language: DEFAULT_LANGUAGE,
      source: "print(1)",
      stdin: "",
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ExecutionError);
    expect((error as ExecutionError).code).toBe("network");
  });
});
