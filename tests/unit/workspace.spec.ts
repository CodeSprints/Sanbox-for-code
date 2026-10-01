import { describe, expect, it } from "vitest";

import {
  collectBareImports,
  findFile,
  missingDependencies,
  normalizePath,
  packageNameOf,
  removeDependency,
  removeFile,
  renameFile,
  setDependency,
  sortFiles,
  uniquePath,
  upsertFile,
  type WebWorkspace,
} from "@/features/web-playground/workspace";

function base(): WebWorkspace {
  return {
    templateId: "test",
    entry: "index.html",
    uiLibrary: "none",
    dependencies: {},
    files: [
      { path: "index.html", content: "<html></html>" },
      { path: "main.ts", content: "export const value = 1;" },
    ],
  };
}

describe("workspace paths", () => {
  it("normalizes separators and prefixes", () => {
    expect(normalizePath("./src\\main.ts")).toBe("src/main.ts");
    expect(normalizePath("/src//main.ts")).toBe("src/main.ts");
  });

  it("creates unique paths for duplicates", () => {
    expect(uniquePath(base(), "main.ts")).toBe("main-2.ts");
    expect(uniquePath(base(), "other.ts")).toBe("other.ts");
  });

  it("sorts files by path", () => {
    const sorted = sortFiles([
      { path: "b.ts", content: "" },
      { path: "a.ts", content: "" },
    ]);

    expect(sorted.map((file) => file.path)).toEqual(["a.ts", "b.ts"]);
  });
});

describe("workspace files", () => {
  it("adds and updates files without mutating the source", () => {
    const original = base();
    const added = upsertFile(original, "./lib.ts", "export const x = 1;");

    expect(original.files).toHaveLength(2);
    expect(findFile(added, "lib.ts")?.content).toBe("export const x = 1;");

    const updated = upsertFile(added, "lib.ts", "export const x = 2;");

    expect(updated.files).toHaveLength(3);
    expect(findFile(updated, "lib.ts")?.content).toBe("export const x = 2;");
  });

  it("removes files but keeps the entry", () => {
    const removed = removeFile(base(), "main.ts");

    expect(findFile(removed, "main.ts")).toBeUndefined();

    const keptEntry = removeFile(base(), "index.html");

    expect(findFile(keptEntry, "index.html")).toBeDefined();
  });

  it("renames files and follows the entry", () => {
    const renamed = renameFile(base(), "index.html", "page.html");

    expect(renamed.entry).toBe("page.html");
    expect(findFile(renamed, "index.html")).toBeUndefined();
    expect(findFile(renamed, "page.html")).toBeDefined();
  });

  it("ignores renames onto an existing path", () => {
    const renamed = renameFile(base(), "main.ts", "index.html");

    expect(findFile(renamed, "main.ts")).toBeDefined();
  });
});

describe("workspace dependencies", () => {
  it("sets and removes dependencies", () => {
    const added = setDependency(base(), "react", "18.3.1");

    expect(added.dependencies).toEqual({ react: "18.3.1" });
    expect(removeDependency(added, "react").dependencies).toEqual({});
  });

  it("extracts package names from specifiers", () => {
    expect(packageNameOf("react")).toBe("react");
    expect(packageNameOf("react-dom/client")).toBe("react-dom");
    expect(packageNameOf("@tanstack/vue-query/build")).toBe("@tanstack/vue-query");
  });

  it("collects bare imports from script files only", () => {
    const workspace: WebWorkspace = {
      ...base(),
      files: [
        {
          path: "main.ts",
          content:
            'import React from "react";\nimport { createRoot } from "react-dom/client";\nimport "./local.css";\nconst lazy = await import("zustand");\nconst legacy = require("lodash");\nconsole.log(React, createRoot, lazy, legacy);',
        },
        { path: "index.html", content: '<script src="https://cdn.example.com/app.js"></script>' },
      ],
    };

    expect(collectBareImports(workspace)).toEqual(["lodash", "react", "react-dom", "zustand"]);
  });

  it("lists only imports without a declared dependency", () => {
    const workspace = setDependency(
      {
        ...base(),
        files: [
          {
            path: "main.ts",
            content: 'import React from "react";\nimport a from "axios";\nconsole.log(React, a);',
          },
        ],
      },
      "react",
      "18.3.1",
    );

    expect(missingDependencies(workspace)).toEqual(["axios"]);
  });
});
