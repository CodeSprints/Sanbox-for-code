import { afterEach, describe, expect, it, vi } from "vitest";

import { copyToClipboard, detectPlatform, detectRuntimeTarget, isTauri } from "@/platform/runtime";

afterEach(() => {
  Reflect.deleteProperty(globalThis, "__TAURI_INTERNALS__");
  Reflect.deleteProperty(globalThis, "__TAURI_OS_PLUGIN_INTERNALS__");
});

describe("runtime detection", () => {
  it("reports the browser when tauri internals are absent", () => {
    expect(isTauri()).toBe(false);
    expect(detectPlatform()).toBe("browser");
    expect(detectRuntimeTarget()).toBe("web");
  });

  it("reports desktop platforms", () => {
    Object.assign(globalThis, {
      __TAURI_INTERNALS__: {},
      __TAURI_OS_PLUGIN_INTERNALS__: { platform: "linux" },
    });

    expect(isTauri()).toBe(true);
    expect(detectPlatform()).toBe("linux");
    expect(detectRuntimeTarget()).toBe("desktop");
  });

  it("reports mobile platforms", () => {
    Object.assign(globalThis, {
      __TAURI_INTERNALS__: {},
      __TAURI_OS_PLUGIN_INTERNALS__: { platform: "android" },
    });

    expect(detectRuntimeTarget()).toBe("mobile");
  });

  it("falls back to unknown for unexpected platforms", () => {
    Object.assign(globalThis, {
      __TAURI_INTERNALS__: {},
      __TAURI_OS_PLUGIN_INTERNALS__: { platform: "plan9" },
    });

    expect(detectPlatform()).toBe("unknown");
    expect(detectRuntimeTarget()).toBe("desktop");
  });
});

describe("copyToClipboard", () => {
  it("uses the browser clipboard api", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });

    await expect(copyToClipboard("text")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("text");
  });

  it("returns false when the clipboard rejects", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });

    await expect(copyToClipboard("text")).resolves.toBe(false);
  });
});
