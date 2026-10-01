# 01 — Introduction

## What Code Sandbox is

Code Sandbox is a code editor with an immediate result preview. The application ships in three editions: browser, desktop and mobile. Every edition is built from a single source tree.

The application has two working modes:

1. **Web project** — you edit a set of files, the application builds them in the browser and the result appears instantly in the preview frame.
2. **Language runner** — you write a program in one of twelve languages, execute it in a remote service and read the output in the console.

## Who it is for

- Learners who want to check a snippet quickly.
- Teachers preparing examples for a class.
- Developers who need a scratchpad without setting up a project.

## Key properties

| Property                | Description                                                                      |
| ----------------------- | -------------------------------------------------------------------------------- |
| One source tree         | The same Vue layer runs in the browser and inside the Tauri window.              |
| Many file types         | HTML, Markdown, EJS, CSS, JSON, JS, MJS, TS, D.TS, JSX, TSX, Vue, Svelte, Rust, Python, C++, C#, Java, Kotlin. |
| Semantic highlighting   | CodeMirror 6 language packages, with errors marked in the editor.               |
| npm packages            | Any package from the npm registry, loaded through esm.sh and an import map.     |
| Language libraries      | The twenty most used libraries for Python, C++, Rust, C#, Java and Kotlin.      |
| Console and devices     | A preview console plus fluid, phone, tablet and desktop preview sizes.          |
| Twelve languages        | Python, TypeScript, JavaScript, C, C++, Go, Rust, Java, Kotlin, Swift, C#, Bash. |
| Two interface languages | Polish and English, switched without a page reload.                              |
| Theme                   | Light, dark or follow the system setting.                                        |
| Accessibility           | WCAG 2.2 level AA conformance and full keyboard operation.                       |
| Offline work            | Web project mode works without internet unless you add a package or a CDN library. |

## Technology stack

- **Vue 3** with `<script setup>` and the Composition API.
- **TypeScript** in `strict` mode.
- **Tailwind CSS 4** with theme tokens defined in CSS.
- **Pinia** as the state container.
- **Vite 7** as the build tool.
- **Tauri 2** as the desktop and mobile shell.
- **Vitest**, **Vue Test Utils** and **axe-core** for tests.

## Project rules

- The code contains no comments. Names of functions, types and files carry the intent.
- Domain logic is separated from components and covered by tests.
- Every control has an accessible name and a visible focus indicator.
- User data stays on the device. Only code explicitly sent for remote execution leaves the machine.
