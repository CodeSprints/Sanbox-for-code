import { computed, ref } from "vue";

import { readStored, writeStored } from "@/platform/storage";

import { en, type Messages } from "./locales/en";
import { pl } from "./locales/pl";

export const LOCALES = ["pl", "en"] as const;

export type Locale = (typeof LOCALES)[number];

type Primitive = string | number;

type PathsOf<T> = {
  [K in keyof T & string]: T[K] extends string ? K : `${K}.${PathsOf<T[K]>}`;
}[keyof T & string];

export type MessageKey = PathsOf<Messages>;

const DICTIONARIES: Record<Locale, Messages> = { pl, en };

const STORAGE_KEY = "locale";

function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

function detectInitialLocale(): Locale {
  const stored = readStored<Locale | null>(STORAGE_KEY, null, (value): value is Locale | null =>
    value === null ? true : isLocale(value),
  );

  if (stored) {
    return stored;
  }

  const navigatorLanguage = globalThis.navigator?.language ?? "en";

  return navigatorLanguage.toLowerCase().startsWith("pl") ? "pl" : "en";
}

const currentLocale = ref<Locale>(detectInitialLocale());

function resolve(dictionary: Messages, key: string): string {
  const segments = key.split(".");
  let node: unknown = dictionary;

  for (const segment of segments) {
    if (typeof node !== "object" || node === null || !(segment in node)) {
      return key;
    }

    node = (node as Record<string, unknown>)[segment];
  }

  return typeof node === "string" ? node : key;
}

export function translate(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, Primitive>,
): string {
  const template = resolve(DICTIONARIES[locale], key);

  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, token: string) =>
    token in params ? String(params[token]) : match,
  );
}

export function setLocale(locale: Locale): void {
  currentLocale.value = locale;
  writeStored(STORAGE_KEY, locale);

  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}

export function useI18n() {
  const locale = computed<Locale>(() => currentLocale.value);
  const t = (key: MessageKey, params?: Record<string, Primitive>): string =>
    translate(currentLocale.value, key, params);

  return { locale, t, setLocale, locales: LOCALES };
}
