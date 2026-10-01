# 03 — Architecture

## Layers

The application has four layers. Each layer only knows the layers below it.

```
Vue components        view and interaction
      ↓
Pinia stores          session state and mode rules
      ↓
domain modules        document building, code execution
      ↓
platform layer        local storage, clipboard, environment detection
```

Because of this split the domain logic does not depend on Vue, and the platform code does not depend on the interface.

## Directory tree

```
src/
  components/        interface components (.vue)
  composables/       reusable functions: theme, media query, shortcuts
  features/
    languages/       language registry, CodeMirror packages, diagnostics
    web-playground/  workspace model, templates, bundler, npm registry client,
                     markup renderers, preview document builder
    code-runner/     language catalogue, library catalogues, manifests,
                     execution service client, output parser
  i18n/              pl and en dictionaries and the translate function
  platform/          environment detection, local storage, clipboard
  stores/            Pinia stores
  styles/            Tailwind layer and theme tokens
  types/             types shared across the application
src-tauri/           Rust shell for desktop and mobile
tests/               unit tests and component tests
docs/                documentation in Polish and English
```

## Data flow in web preview mode

1. The user types in the editor of the active file.
2. The component updates the workspace in the `web-playground` store.
3. The store writes the workspace to local storage and waits 450 ms.
4. After that delay `buildPreview` reads the entry file. For an HTML entry it calls `bundleEntry` for every linked script, for Markdown it calls `renderMarkdown`, for EJS it calls `renderEjs`.
5. `bundleEntry` runs esbuild compiled to WebAssembly. A plugin resolves imports inside the workspace, compiles Vue and Svelte files and keeps bare imports external.
6. The builder injects the collected CSS, the UI library tags, the import map of npm dependencies and the console bridge into the `head` of the document.
7. The `<iframe>` with the `srcdoc` attribute receives the new document.
8. The bridge sends console messages and errors through `postMessage`; the store appends them to the console history.
9. Build diagnostics are stored per file and reach the editor as lint markers.

The frame runs with the `allow-scripts allow-modals allow-forms allow-popups` sandbox. It has no access to the application origin, so user code cannot read application data.

## Data flow in language runner mode

1. The user picks a language and writes code. The `code-runner` store keeps separate code per language.
2. The **Run** button calls `runCode`.
3. `runCode` sends a request to the Piston service with a 20 second timeout.
4. Selected libraries produce a manifest file, which is sent next to the source file.
5. The response contains a compile stage and a run stage. The module merges both outputs.
6. The store records the result, the exit code and the duration, and the view prints them in the console.
7. `parseOutputDiagnostics` maps compiler and runtime messages to editor markers.

Every execution can be cancelled. The store uses an `AbortController`, so cancelling closes the connection.

## One codebase, three platforms

The interface layer does not know where it runs. `src/platform/runtime.ts` encapsulates the differences:

| Function              | Browser               | Tauri                                         |
| --------------------- | --------------------- | --------------------------------------------- |
| `isTauri`             | `false`               | `true`                                        |
| `detectPlatform`      | `browser`             | `windows`, `macos`, `linux`, `android`, `ios` |
| `detectRuntimeTarget` | `web`                 | `desktop` or `mobile`                         |
| `copyToClipboard`     | `navigator.clipboard` | the `clipboard-manager` plugin                |

The Tauri plugin is imported dynamically, so browser builds never download its code.

## State and persistence

| Local storage key              | Content                    |
| ------------------------------ | -------------------------- |
| `code-sandbox:web-workspace`   | the web mode workspace     |
| `code-sandbox:web-auto-run`    | the auto refresh setting   |
| `code-sandbox:runner-language` | the last selected language |
| `code-sandbox:runner-sources`  | source code per language   |
| `code-sandbox:runner-libraries`| selected libraries per language |
| `code-sandbox:theme`           | the selected theme         |
| `code-sandbox:locale`          | the interface language     |
| `code-sandbox:mode`            | the active working mode    |

Every read passes through a type guard. A corrupted entry does not break the application — the module returns the default value.

## Build size

esbuild, the Vue compiler and the Svelte compiler are imported dynamically. The first preview build downloads the WebAssembly binary and the compiler of the language that the workspace uses; a workspace without Vue files never downloads the Vue compiler.
