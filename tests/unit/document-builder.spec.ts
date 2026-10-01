// @vitest-environment node
import { describe, expect, it } from "vitest";

import { buildPreview } from "@/features/web-playground/document-builder";
import type { WebWorkspace, WorkspaceFile } from "@/features/web-playground/workspace";

function workspace(
  entry: string,
  files: WorkspaceFile[],
  extra: Partial<WebWorkspace> = {},
): WebWorkspace {
  return {
    templateId: "test",
    entry,
    uiLibrary: "none",
    dependencies: {},
    files,
    ...extra,
  };
}

describe("buildPreview", () => {
  it("inlines linked stylesheets and bundles module scripts", async () => {
    const build = await buildPreview(
      workspace("index.html", [
        {
          path: "index.html",
          content:
            '<!doctype html>\n<html>\n<head>\n<link rel="stylesheet" href="styles.css">\n</head>\n<body>\n<div id="app"></div>\n<script type="module" src="main.ts"></script>\n</body>\n</html>',
        },
        { path: "styles.css", content: "body { color: teal; }" },
        { path: "main.ts", content: 'const target = "done";\nconsole.log(target);' },
      ]),
    );

    expect(build.diagnostics).toEqual([]);
    expect(build.document).toContain("<style>body { color: teal; }</style>");
    expect(build.document).not.toContain('src="main.ts"');
    expect(build.document).toContain('var target = "done"');
  });

  it("injects the console bridge and the viewport meta tag", async () => {
    const build = await buildPreview(
      workspace("index.html", [
        { path: "index.html", content: "<html><head></head><body></body></html>" },
      ]),
    );

    expect(build.document).toContain("code-sandbox-preview");
    expect(build.document).toContain("unhandledrejection");
  });

  it("adds an import map for declared dependencies", async () => {
    const build = await buildPreview(
      workspace(
        "index.html",
        [{ path: "index.html", content: "<html><head></head><body></body></html>" }],
        { dependencies: { react: "18.3.1", "react-dom": "18.3.1" } },
      ),
    );

    expect(build.document).toContain('<script type="importmap">');
    expect(build.document).toContain("esm.sh/react@18.3.1");
    expect(build.document).toContain("external=react-dom");
  });

  it("adds the ui library tags when one is selected", async () => {
    const build = await buildPreview(
      workspace(
        "index.html",
        [{ path: "index.html", content: "<html><head></head><body></body></html>" }],
        { uiLibrary: "bootstrap" },
      ),
    );

    expect(build.document).toContain("bootstrap");
  });

  it("escapes closing script tags inside bundled code", async () => {
    const build = await buildPreview(
      workspace("index.html", [
        {
          path: "index.html",
          content:
            '<html><head></head><body><script type="module" src="main.ts"></script></body></html>',
        },
        { path: "main.ts", content: 'document.body.innerHTML = "<script><\\/script>";' },
      ]),
    );

    expect(build.document).not.toContain('innerHTML = "<script></script>"');
  });

  it("renders markdown entries as an article", async () => {
    const build = await buildPreview(
      workspace("readme.md", [{ path: "readme.md", content: "# Title\n\nSome **bold** text." }]),
      "pl",
    );

    expect(build.document).toContain('<html lang="pl">');
    expect(build.document).toContain("<h1>Title</h1>");
    expect(build.document).toContain("<strong>bold</strong>");
  });

  it("renders ejs entries with data.json", async () => {
    const build = await buildPreview(
      workspace("page.ejs", [
        {
          path: "page.ejs",
          content: "<ul><% items.forEach(function (item) { %><li><%= item %></li><% }); %></ul>",
        },
        { path: "data.json", content: '{ "items": ["one", "two"] }' },
      ]),
    );

    expect(build.diagnostics).toEqual([]);
    expect(build.document).toContain("<li>one</li><li>two</li>");
  });

  it("reports invalid data.json as a diagnostic", async () => {
    const build = await buildPreview(
      workspace("page.ejs", [
        { path: "page.ejs", content: "<p><%= title %></p>" },
        { path: "data.json", content: "{ oops" },
      ]),
    );

    expect(build.diagnostics[0]?.file).toBe("data.json");
    expect(build.diagnostics[0]?.severity).toBe("error");
  });

  it("reports a missing entry file", async () => {
    const build = await buildPreview(workspace("index.html", []));

    expect(build.diagnostics[0]?.message).toContain("Entry file not found");
  });

  it("surfaces bundling errors as diagnostics", async () => {
    const build = await buildPreview(
      workspace("index.html", [
        {
          path: "index.html",
          content:
            '<html><head></head><body><script type="module" src="main.ts"></script></body></html>',
        },
        { path: "main.ts", content: "const broken = (" },
      ]),
    );

    expect(build.diagnostics.some((diagnostic) => diagnostic.severity === "error")).toBe(true);
  });
});
