# 04 — Features

## Web project mode

### File explorer

A project is a list of files. The explorer on the left lists every file, marks the entry file with a badge and shows the number of build errors next to a file name. The **New file** button asks for a name; the action menu of each row offers rename, set as entry file and delete. The entry file cannot be deleted.

The file extension decides how the file is treated. Supported extensions:

| Group  | Extensions                                              |
| ------ | ------------------------------------------------------- |
| Markup | `.html`, `.htm`, `.ejs`, `.md`, `.markdown`             |
| Style  | `.css`                                                  |
| Data   | `.json`                                                 |
| Script | `.js`, `.mjs`, `.cjs`, `.jsx`, `.ts`, `.mts`, `.cts`, `.d.ts`, `.tsx`, `.vue`, `.svelte` |
| Program| `.rs`, `.py`, `.cpp`, `.cc`, `.hpp`, `.cs`, `.java`, `.kt`, `.kts`, `.sh` |

### Editor

The editor is CodeMirror 6. Every file gets the language package matching its extension, so highlighting is semantic: keywords, types, functions, properties, tags, attributes, strings and comments use separate theme tokens that follow the light and dark theme.

| Feature             | Description                                                           |
| ------------------- | --------------------------------------------------------------------- |
| Highlighting        | semantic tokens from the language parser, not a regular expression     |
| Error marking       | parser errors and build errors appear in the gutter and under the text |
| Line numbers        | with active line highlighting and code folding                         |
| Brackets            | automatic closing and matching highlight                               |
| Autocompletion      | from the language package and from the document                        |
| Search              | Ctrl + F inside the editor                                             |
| Keyboard            | Tab indents, Escape releases Tab so focus can leave the editor         |

A footer below the editor lists the problems of the active file with line, column and message. When a file is clean it reads that there are no problems.

### Templates

| Template               | Entry file    | Contents                                        |
| ---------------------- | ------------- | ----------------------------------------------- |
| Vanilla TypeScript     | `index.html`  | HTML, CSS and TypeScript modules                |
| React + TSX            | `index.html`  | `App.tsx` with the automatic JSX runtime        |
| Vue single file        | `index.html`  | `App.vue` with `<script setup>` and scoped CSS  |
| Svelte                 | `index.html`  | `App.svelte` compiled in the browser            |
| Markdown document      | `readme.md`   | a document rendered to HTML                     |
| EJS template           | `page.ejs`    | a template with data in `data.json`             |

Choosing a template replaces the whole project.

### Build

The preview is built in the browser by esbuild compiled to WebAssembly. The builder resolves relative imports inside the project, compiles TypeScript, JSX and TSX, compiles Vue single file components with `@vue/compiler-sfc` and Svelte components with the Svelte compiler, imports JSON as a module and collects CSS imported from modules.

For an HTML entry file the builder replaces `<link rel="stylesheet">` with the file content and `<script src>` with the bundled module. A Markdown entry file is rendered with `marked`. An EJS entry file is rendered by the built-in template engine, which reads its data from `data.json`.

Build errors are shown in three places: in the editor of the file that caused them, as a count next to the file name and as a status line above the preview.

### npm packages

The **npm packages** panel accepts any package from the npm registry. You can type a name and a version, or search the registry and add a result. If the code imports a package that is not on the list, the panel offers to add it with its latest version.

Packages are loaded from `https://esm.sh`. The preview document contains an import map that points every dependency at that network and marks the other dependencies as external, so all modules share a single copy of a library. Bare imports stay bare in the bundle and the browser resolves them through the import map.

### UI libraries

The list contains Tailwind CSS 4, Bootstrap 5, Bulma, Pico.css, Water.css, Font Awesome and Animate.css. The selected library is injected into the `head` of the preview document. The **None** option leaves the document without external style resources.

### Preview and devices

The preview is a sandboxed `<iframe>` filled through `srcdoc`. A size list above the frame covers four cases:

| Preset  | Size        | Use case          |
| ------- | ----------- | ----------------- |
| Fluid   | full width  | responsive layout |
| Phone   | 390 × 844   | mobile            |
| Tablet  | 820 × 1180  | tablet            |
| Desktop | 1280 × 800  | desktop           |

The **Rotate** button swaps width and height, so you can check landscape orientation. The current orientation is announced in text next to the frame.

### Console

The preview document carries a bridge that wraps `console.log`, `console.info`, `console.warn`, `console.error` and `console.debug`, and listens for `error` and `unhandledrejection` events. Every message is sent to the application with `postMessage` and appears in the console panel with a timestamp and a level.

The panel filters messages by level, counts errors, warnings and messages in a live region, and the **Clear console** button empties the list. The history keeps the last 200 entries.

### Refreshing

The **Auto refresh** switch rebuilds the project 450 ms after the last change. With the switch off the preview updates on the **Run** button or the Ctrl + Enter shortcut (Cmd + Enter on macOS).

### Copying the document

The **Copy document** button writes the full built HTML document to the clipboard. In the browser it uses `navigator.clipboard`, in the Tauri application it uses the clipboard plugin. The result is announced through an `aria-live` region.

## Language runner mode

### Choosing a language

The list contains twelve languages: Python, TypeScript, JavaScript, C, C++, Go, Rust, Java, Kotlin, Swift, C# and Bash. Each has its own starter template and file name. Source code is remembered per language, so switching does not discard previous work.

### Library catalogue

Six languages have a catalogue of the twenty most used libraries:

| Language | Manifest written with the program | Examples                              |
| -------- | --------------------------------- | ------------------------------------- |
| Python   | `requirements.txt`                | NumPy, pandas, Requests, FastAPI      |
| C++      | `vcpkg.json`                      | Boost, fmt, spdlog, Eigen             |
| Rust     | `Cargo.toml`                      | serde, tokio, clap, reqwest           |
| C#       | `sandbox.csproj`                  | Newtonsoft.Json, Serilog, Dapper      |
| Java     | `pom.xml`                         | Guava, Jackson, JUnit, Spring Boot    |
| Kotlin   | `build.gradle.kts`                | kotlinx.coroutines, Ktor, Exposed     |

Selecting a library adds its entry to the manifest, and the generated manifest is visible in the panel and sent with the program. The **Insert** button next to a library adds its import line at the top of the source file.

### Standard input

The **Standard input** field passes text to the program on `stdin`. The field is optional.

### Running

The **Run** button sends the code and the manifest to the Piston service. While it works the button carries `aria-busy` and a **Cancel** button appears next to it. The request times out after 20 seconds.

### Errors in the output

Compiler and runtime messages are parsed and mapped to editor markers. The parser understands the formats of gcc and clang, MSBuild and the C# compiler, rustc, Python tracebacks, javac and the Kotlin compiler. A recognised message marks the line in the editor; the full text stays in the console.

### Console

The console has the `log` role and `aria-live="polite"`. When execution finishes it shows one of these messages:

| State         | Message                           |
| ------------- | --------------------------------- |
| success       | run duration and exit code        |
| failure       | the exit code of the program      |
| cancelled     | a note about the cancellation     |
| network issue | a request to check the connection |
| rate limit    | a request to wait a moment        |

## Shared settings

| Setting  | Values                      | Remembered |
| -------- | --------------------------- | ---------- |
| Mode     | web project, language runner| yes        |
| Theme    | system, light, dark         | yes        |
| Language | Polish, English             | yes        |

The status bar at the bottom shows the edition, the platform name and the network state.
