import { computed, ref, watchEffect } from "vue";

import { readStored, writeStored } from "@/platform/storage";

export const THEME_PREFERENCES = ["system", "light", "dark"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];

const STORAGE_KEY = "theme";

function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && (THEME_PREFERENCES as readonly string[]).includes(value);
}

const preference = ref<ThemePreference>(
  readStored<ThemePreference>(STORAGE_KEY, "system", isThemePreference),
);

function prefersDark(): boolean {
  return globalThis.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

const systemPrefersDark = ref(prefersDark());

let mediaListenerAttached = false;

function attachMediaListener(): void {
  if (mediaListenerAttached || typeof globalThis.matchMedia !== "function") {
    return;
  }

  const query = globalThis.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", (event) => {
    systemPrefersDark.value = event.matches;
  });
  mediaListenerAttached = true;
}

export function useTheme() {
  attachMediaListener();

  const resolvedTheme = computed<"light" | "dark">(() => {
    if (preference.value === "system") {
      return systemPrefersDark.value ? "dark" : "light";
    }

    return preference.value;
  });

  watchEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme.value === "dark");
    root.style.colorScheme = resolvedTheme.value;
  });

  function setPreference(next: ThemePreference): void {
    preference.value = next;
    writeStored(STORAGE_KEY, next);
  }

  return { preference: computed(() => preference.value), resolvedTheme, setPreference };
}
