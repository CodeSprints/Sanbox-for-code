export type RuntimeTarget = "web" | "desktop" | "mobile";

export type PlatformName =
  "windows" | "macos" | "linux" | "android" | "ios" | "browser" | "unknown";

interface TauriGlobals {
  __TAURI_INTERNALS__?: unknown;
  __TAURI_OS_PLUGIN_INTERNALS__?: { platform?: string };
}

function getGlobals(): TauriGlobals {
  return (globalThis as unknown as TauriGlobals) ?? {};
}

export function isTauri(): boolean {
  return typeof getGlobals().__TAURI_INTERNALS__ !== "undefined";
}

export function detectPlatform(): PlatformName {
  if (!isTauri()) {
    return "browser";
  }

  const reported = getGlobals().__TAURI_OS_PLUGIN_INTERNALS__?.platform;

  switch (reported) {
    case "windows":
    case "macos":
    case "linux":
    case "android":
    case "ios":
      return reported;
    default:
      return "unknown";
  }
}

export function detectRuntimeTarget(): RuntimeTarget {
  const platform = detectPlatform();

  if (platform === "browser") {
    return "web";
  }

  if (platform === "android" || platform === "ios") {
    return "mobile";
  }

  return "desktop";
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (isTauri()) {
      const { writeText } = await import("@tauri-apps/plugin-clipboard-manager");
      await writeText(text);
      return true;
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
