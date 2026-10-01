import { describe, expect, it } from "vitest";

import {
  detectLanguage,
  getExtension,
  getLanguage,
  isSupportedExtension,
  SUPPORTED_EXTENSIONS,
} from "@/features/languages/registry";

describe("language registry", () => {
  it("detects every requested source extension", () => {
    const expectations: [string, string][] = [
      ["page.html", "html"],
      ["readme.md", "markdown"],
      ["main.ts", "typescript"],
      ["main.js", "javascript"],
      ["main.mjs", "javascript"],
      ["view.ejs", "ejs"],
      ["App.vue", "vue"],
      ["App.tsx", "tsx"],
      ["App.jsx", "jsx"],
      ["App.svelte", "svelte"],
      ["main.rs", "rust"],
      ["main.py", "python"],
      ["main.cpp", "cpp"],
      ["Program.cs", "csharp"],
      ["Main.java", "java"],
      ["Main.kt", "kotlin"],
      ["types.d.ts", "declaration"],
      ["data.json", "json"],
      ["theme.css", "css"],
    ];

    for (const [path, id] of expectations) {
      expect(detectLanguage(path).id, path).toBe(id);
    }
  });

  it("prefers the longer .d.ts extension over .ts", () => {
    expect(getExtension("global.d.ts")).toBe(".d.ts");
    expect(getExtension("global.ts")).toBe(".ts");
  });

  it("falls back to plain text for unknown files", () => {
    expect(detectLanguage("notes.unknown").id).toBe("plain");
    expect(isSupportedExtension("notes.unknown")).toBe(false);
    expect(isSupportedExtension("notes.md")).toBe(true);
  });

  it("exposes unique extensions and resolvable ids", () => {
    expect(new Set(SUPPORTED_EXTENSIONS).size).toBe(SUPPORTED_EXTENSIONS.length);
    expect(getLanguage("kotlin").label).toBe("Kotlin");
  });
});
