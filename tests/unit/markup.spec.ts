import { describe, expect, it } from "vitest";

import { escapeHtml, renderEjs, renderMarkdown } from "@/features/web-playground/markup";

describe("renderMarkdown", () => {
  it("renders headings, lists and code", async () => {
    const html = await renderMarkdown("# Title\n\n- one\n- two\n\n`code`");

    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<li>one</li>");
    expect(html).toContain("<code>code</code>");
  });
});

describe("escapeHtml", () => {
  it("escapes markup characters", () => {
    expect(escapeHtml("<img src=\"x\" onerror='y'>&")).toBe(
      "&lt;img src=&quot;x&quot; onerror=&#39;y&#39;&gt;&amp;",
    );
  });

  it("renders nullish values as an empty string", () => {
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
    expect(escapeHtml(7)).toBe("7");
  });
});

describe("renderEjs", () => {
  it("interpolates escaped values", () => {
    expect(renderEjs("<p><%= name %></p>", { name: "<b>" })).toBe("<p>&lt;b&gt;</p>");
  });

  it("supports raw output", () => {
    expect(renderEjs("<p><%- html %></p>", { html: "<b>x</b>" })).toBe("<p><b>x</b></p>");
  });

  it("supports control flow", () => {
    const output = renderEjs("<% for (const item of items) { %><li><%= item %></li><% } %>", {
      items: ["a", "b"],
    });

    expect(output).toBe("<li>a</li><li>b</li>");
  });

  it("skips comment tags", () => {
    expect(renderEjs("a<%# hidden %>b", {})).toBe("ab");
  });

  it("throws on invalid templates", () => {
    expect(() => renderEjs("<% if (true) { %>", {})).toThrow();
  });
});
