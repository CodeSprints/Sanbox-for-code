import type { WebWorkspace } from "./workspace";

export interface WorkspaceTemplate {
  id: string;
  label: string;
  description: string;
  create: () => WebWorkspace;
}

const PAGE_CSS = `:root {
  color-scheme: dark;
}

body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  background: #0f172a;
  color: #e2e8f0;
}

.card {
  padding: 2rem 2.5rem;
  border-radius: 16px;
  background: #1e293b;
  text-align: center;
  box-shadow: 0 20px 60px rgb(0 0 0 / 0.45);
}

button {
  margin-top: 1rem;
  padding: 0.6rem 1.4rem;
  border: 0;
  border-radius: 8px;
  background: #22c55e;
  color: #052e16;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

button:focus-visible {
  outline: 3px solid #bbf7d0;
  outline-offset: 2px;
}`;

function htmlShell(body: string, script: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Code Sandbox preview</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
${body}
    <script type="module" src="./${script}"></script>
  </body>
</html>`;
}

export const WORKSPACE_TEMPLATES: readonly WorkspaceTemplate[] = [
  {
    id: "vanilla",
    label: "Vanilla TypeScript",
    description: "HTML, CSS and a TypeScript module.",
    create: () => ({
      templateId: "vanilla",
      entry: "index.html",
      uiLibrary: "none",
      dependencies: {},
      files: [
        {
          path: "index.html",
          content: htmlShell(
            `    <main class="card">
      <h1>Vanilla TypeScript</h1>
      <p>Edit any file on the left and watch the preview.</p>
      <button id="counter" type="button">Clicks: 0</button>
    </main>`,
            "main.ts",
          ),
        },
        { path: "styles.css", content: PAGE_CSS },
        {
          path: "main.ts",
          content: `import { createCounter } from "./counter";

const button = document.querySelector<HTMLButtonElement>("#counter");

if (button) {
  createCounter(button);
}
`,
        },
        {
          path: "counter.ts",
          content: `export function createCounter(button: HTMLButtonElement): void {
  let clicks = 0;

  button.addEventListener("click", () => {
    clicks += 1;
    button.textContent = \`Clicks: \${clicks}\`;
  });
}
`,
        },
      ],
    }),
  },
  {
    id: "react",
    label: "React + TSX",
    description: "React 18 with TypeScript and JSX.",
    create: () => ({
      templateId: "react",
      entry: "index.html",
      uiLibrary: "none",
      dependencies: { react: "18.3.1", "react-dom": "18.3.1" },
      files: [
        { path: "index.html", content: htmlShell(`    <div id="root"></div>`, "main.tsx") },
        { path: "styles.css", content: PAGE_CSS },
        {
          path: "main.tsx",
          content: `import { createRoot } from "react-dom/client";

import { App } from "./App";

const container = document.querySelector("#root");

if (container) {
  createRoot(container).render(<App />);
}
`,
        },
        {
          path: "App.tsx",
          content: `import { useState } from "react";

import type { Props } from "./types";

export function App({ title = "React + TSX" }: Props) {
  const [clicks, setClicks] = useState(0);

  return (
    <main className="card">
      <h1>{title}</h1>
      <p>Any npm package can be added in the Packages panel.</p>
      <button type="button" onClick={() => setClicks(clicks + 1)}>
        Clicks: {clicks}
      </button>
    </main>
  );
}
`,
        },
        {
          path: "types.d.ts",
          content: `export interface Props {
  title?: string;
}
`,
        },
      ],
    }),
  },
  {
    id: "vue",
    label: "Vue single file components",
    description: "Vue 3 with .vue components and TypeScript.",
    create: () => ({
      templateId: "vue",
      entry: "index.html",
      uiLibrary: "none",
      dependencies: { vue: "3.5.22" },
      files: [
        { path: "index.html", content: htmlShell(`    <div id="app"></div>`, "main.ts") },
        { path: "styles.css", content: PAGE_CSS },
        {
          path: "main.ts",
          content: `import { createApp } from "vue";

import App from "./App.vue";

createApp(App).mount("#app");
`,
        },
        {
          path: "App.vue",
          content: `<script setup lang="ts">
import { ref } from "vue";

import CounterButton from "./CounterButton.vue";

const clicks = ref(0);
</script>

<template>
  <main class="card">
    <h1>Vue single file components</h1>
    <p>Script, template and scoped styles live in one file.</p>
    <CounterButton :clicks="clicks" @increment="clicks += 1" />
  </main>
</template>
`,
        },
        {
          path: "CounterButton.vue",
          content: `<script setup lang="ts">
defineProps<{ clicks: number }>();
defineEmits<{ increment: [] }>();
</script>

<template>
  <button type="button" @click="$emit('increment')">Clicks: {{ clicks }}</button>
</template>

<style scoped>
button {
  letter-spacing: 0.02em;
}
</style>
`,
        },
      ],
    }),
  },
  {
    id: "svelte",
    label: "Svelte",
    description: "Svelte components compiled in the browser.",
    create: () => ({
      templateId: "svelte",
      entry: "index.html",
      uiLibrary: "none",
      dependencies: { svelte: "5.39.5" },
      files: [
        { path: "index.html", content: htmlShell(`    <div id="app"></div>`, "main.ts") },
        { path: "styles.css", content: PAGE_CSS },
        {
          path: "main.ts",
          content: `import { mount } from "svelte";

import App from "./App.svelte";

const target = document.querySelector("#app");

if (target) {
  mount(App, { target });
}
`,
        },
        {
          path: "App.svelte",
          content: `<script lang="ts">
  let clicks = $state(0);
</script>

<main class="card">
  <h1>Svelte</h1>
  <p>Runes keep the state and the markup in sync.</p>
  <button type="button" onclick={() => (clicks += 1)}>Clicks: {clicks}</button>
</main>
`,
        },
      ],
    }),
  },
  {
    id: "markdown",
    label: "Markdown document",
    description: "A document rendered to HTML.",
    create: () => ({
      templateId: "markdown",
      entry: "README.md",
      uiLibrary: "pico",
      dependencies: {},
      files: [
        {
          path: "README.md",
          content: `# Markdown document

The preview renders this file to HTML.

## Lists

1. Headings, lists and tables.
2. Code blocks with highlighting.
3. Links and images.

## Code

\`\`\`ts
export const greeting: string = "Hello";
\`\`\`

| Column | Meaning     |
| ------ | ----------- |
| entry  | the rendered file |
`,
        },
      ],
    }),
  },
  {
    id: "ejs",
    label: "EJS template",
    description: "A server style template rendered with data.",
    create: () => ({
      templateId: "ejs",
      entry: "page.ejs",
      uiLibrary: "bootstrap",
      dependencies: {},
      files: [
        {
          path: "page.ejs",
          content: `<main class="container py-5">
  <h1 class="mb-3"><%= title %></h1>
  <p class="lead"><%= description %></p>

  <ul class="list-group">
    <% items.forEach(function (item) { %>
    <li class="list-group-item"><%= item %></li>
    <% }); %>
  </ul>
</main>
`,
        },
        {
          path: "data.json",
          content: `{
  "title": "EJS template",
  "description": "Data from data.json is passed to the template.",
  "items": ["First item", "Second item", "Third item"]
}
`,
        },
      ],
    }),
  },
];

export function createWorkspace(templateId: string): WebWorkspace {
  const template =
    WORKSPACE_TEMPLATES.find((entry) => entry.id === templateId) ?? WORKSPACE_TEMPLATES[0];

  return (template as WorkspaceTemplate).create();
}

export const DEFAULT_WORKSPACE: WebWorkspace = createWorkspace("vanilla");
