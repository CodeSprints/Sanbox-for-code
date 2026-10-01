import { describe, expect, it } from "vitest";

import { en } from "@/i18n/locales/en";
import { pl } from "@/i18n/locales/pl";
import { LOCALES, setLocale, translate, useI18n, type MessageKey } from "@/i18n";

function flatten(value: object, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, entry]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof entry === "object" && entry !== null ? flatten(entry, path) : [path];
  });
}

describe("dictionaries", () => {
  it("expose the same keys in every locale", () => {
    expect(flatten(pl).sort()).toEqual(flatten(en).sort());
  });

  it("contain no empty translations", () => {
    for (const locale of LOCALES) {
      for (const key of flatten(en)) {
        expect(translate(locale, key as MessageKey).length).toBeGreaterThan(0);
      }
    }
  });
});

describe("translate", () => {
  it("returns the localized message", () => {
    expect(translate("pl", "runner.run")).toBe("Uruchom");
    expect(translate("en", "runner.run")).toBe("Run");
  });

  it("interpolates named parameters", () => {
    expect(translate("en", "runner.succeeded", { duration: 12, code: 0 })).toBe(
      "Finished in 12 ms with exit code 0.",
    );
  });

  it("keeps unknown placeholders untouched", () => {
    expect(translate("en", "runner.succeeded", { duration: 1 })).toContain("{code}");
  });

  it("returns the key when it cannot be resolved", () => {
    expect(translate("en", "does.not.exist" as MessageKey)).toBe("does.not.exist");
  });
});

describe("useI18n", () => {
  it("switches the active locale and persists it", () => {
    const { t, locale } = useI18n();

    setLocale("en");
    expect(locale.value).toBe("en");
    expect(t("app.skipToContent")).toBe("Skip to main content");

    setLocale("pl");
    expect(t("app.skipToContent")).toBe("Przejdź do treści głównej");
    expect(document.documentElement.lang).toBe("pl");
  });
});
