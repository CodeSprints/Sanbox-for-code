import { describe, expect, it, vi } from "vitest";

import { readStored, writeStored } from "@/platform/storage";

describe("storage", () => {
  it("returns the fallback for missing keys", () => {
    expect(readStored("missing", "fallback")).toBe("fallback");
  });

  it("writes and reads json values", () => {
    writeStored("sample", { a: 1 });

    expect(readStored("sample", {})).toEqual({ a: 1 });
  });

  it("namespaces the stored keys", () => {
    writeStored("namespaced", true);

    expect(localStorage.getItem("code-sandbox:namespaced")).toBe("true");
  });

  it("returns the fallback for malformed payloads", () => {
    localStorage.setItem("code-sandbox:broken", "{oops");

    expect(readStored("broken", "fallback")).toBe("fallback");
  });

  it("rejects values that do not satisfy the guard", () => {
    writeStored("guarded", 42);

    const value = readStored(
      "guarded",
      "fallback",
      (candidate): candidate is string => typeof candidate === "string",
    );

    expect(value).toBe("fallback");
  });

  it("degrades gracefully when storage is unavailable", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("denied");
    });

    expect(() => writeStored("blocked", 1)).not.toThrow();
    expect(readStored("blocked", "fallback")).toBe("fallback");

    setItem.mockRestore();
  });
});
