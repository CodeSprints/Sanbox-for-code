// @vitest-environment node
import { describe, expect, it } from "vitest";

import { bundleEntry } from "@/features/web-playground/bundler";
import type { WebWorkspace, WorkspaceFile } from "@/features/web-playground/workspace";

function workspace(
  files: WorkspaceFile[],
  dependencies: Record<string, string> = {},
): WebWorkspace {
  return { templateId: "test", entry: "index.html", uiLibrary: "none", dependencies, files };
}

describe("bundleEntry", () => {
  it("bundles relative TypeScript modules", async () => {
    const result = await bundleEntry(
      workspace([
        { path: "main.ts", content: 'import { value } from "./lib";\nconsole.log(value);' },
        { path: "lib.ts", content: "export const value: number = 41 + 1;" },
      ]),
      "main.ts",
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("41 + 1");
  });

  it("keeps bare imports external so the import map can resolve them", async () => {
    const result = await bundleEntry(
      workspace([{ path: "main.ts", content: 'import React from "react";\nconsole.log(React);' }], {
        react: "18.3.1",
      }),
      "main.ts",
    );

    expect(result.code).toContain('from "react"');
  });

  it("compiles TSX with the automatic JSX runtime", async () => {
    const result = await bundleEntry(
      workspace(
        [
          {
            path: "App.tsx",
            content: 'export const App = () => <p className="a">hello</p>;\nconsole.log(App);',
          },
        ],
        { react: "18.3.1" },
      ),
      "App.tsx",
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("react/jsx-runtime");
  });

  it("imports JSON files", async () => {
    const result = await bundleEntry(
      workspace([
        { path: "main.ts", content: 'import data from "./data.json";\nconsole.log(data);' },
        { path: "data.json", content: '{ "title": "from json" }' },
      ]),
      "main.ts",
    );

    expect(result.code).toContain("from json");
  });

  it("collects css imported from modules", async () => {
    const result = await bundleEntry(
      workspace([
        { path: "main.ts", content: 'import "./styles.css";\nconsole.log("ready");' },
        { path: "styles.css", content: ".card { color: red; }" },
      ]),
      "main.ts",
    );

    expect(result.css).toContain(".card");
  });

  it("compiles Vue single file components", async () => {
    const result = await bundleEntry(
      workspace(
        [
          { path: "main.ts", content: 'import App from "./App.vue";\nconsole.log(App);' },
          {
            path: "App.vue",
            content:
              '<script setup lang="ts">\nconst title = "Vue";\n</script>\n\n<template>\n  <h1>{{ title }}</h1>\n</template>\n\n<style scoped>\nh1 { color: red; }\n</style>\n',
          },
        ],
        { vue: "3.5.22" },
      ),
      "main.ts",
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("data-v-");
    expect(result.code).toContain('from "vue"');
  });

  it("compiles Svelte components", async () => {
    const result = await bundleEntry(
      workspace(
        [
          { path: "main.ts", content: 'import App from "./App.svelte";\nconsole.log(App);' },
          {
            path: "App.svelte",
            content: "<script>\n  let name = 'world';\n</script>\n\n<h1>hello {name}</h1>\n",
          },
        ],
        { svelte: "5.39.5" },
      ),
      "main.ts",
    );

    expect(result.diagnostics).toEqual([]);
    expect(result.code).toContain("svelte/internal/client");
  });

  it("reports missing workspace files as diagnostics", async () => {
    const result = await bundleEntry(
      workspace([{ path: "main.ts", content: 'import "./nope";' }]),
      "main.ts",
    );

    expect(result.diagnostics[0]?.severity).toBe("error");
    expect(result.diagnostics[0]?.message).toContain("nope");
  });

  it("reports syntax errors with a position", async () => {
    const result = await bundleEntry(
      workspace([{ path: "main.ts", content: "const broken = (" }]),
      "main.ts",
    );

    expect(result.diagnostics[0]?.file).toBe("main.ts");
    expect(result.diagnostics[0]?.line).toBeGreaterThan(0);
  });
});
