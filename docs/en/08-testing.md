# 08 — Testing

## Tools

| Tool           | Purpose                                   |
| -------------- | ----------------------------------------- |
| Vitest         | running tests in the jsdom environment    |
| Vue Test Utils | mounting components and simulating events |
| axe-core       | automated accessibility audit             |
| Coverage V8    | code coverage report                      |

## Running

```bash
npm run test
npm run test:watch
npm run test:coverage
npm run verify
```

`npm run verify` runs lint, type checking and tests in sequence. The CI pipeline uses the same command.

## Test scope

| File                                        | What it checks                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| `tests/unit/registry.spec.ts`               | extension detection for every supported language                          |
| `tests/unit/workspace.spec.ts`              | file operations, path normalisation, bare imports, missing dependencies   |
| `tests/unit/bundler.spec.ts`                | real esbuild builds: TypeScript, TSX, JSON, CSS, Vue, Svelte, error output|
| `tests/unit/document-builder.spec.ts`       | HTML, Markdown and EJS entries, import map, console bridge, diagnostics   |
| `tests/unit/dependencies.spec.ts`           | esm.sh addresses, import map, registry search and version lookup          |
| `tests/unit/markup.spec.ts`                 | Markdown rendering, HTML escaping and the EJS engine                      |
| `tests/unit/libraries.spec.ts`              | twenty libraries per language and every generated manifest                |
| `tests/unit/output-diagnostics.spec.ts`     | compiler output parsing for gcc, MSBuild, rustc, Python, javac and Kotlin |
| `tests/unit/runner.spec.ts`                 | request format, output merging and error mapping                          |
| `tests/unit/i18n.spec.ts`                   | dictionary key parity and parameter interpolation                         |
| `tests/unit/storage.spec.ts`                | write, read, type guards and missing local storage                        |
| `tests/unit/runtime.spec.ts`                | browser, desktop and mobile detection                                     |
| `tests/unit/web-playground-store.spec.ts`   | file and dependency actions, debounced build, console history, devices    |
| `tests/unit/code-runner-store.spec.ts`      | execution states, cancelling, per-language sources and libraries          |
| `tests/components/CodeMirrorEditor.spec.ts` | document rendering, accessible name, model updates, lint markers          |
| `tests/components/FileExplorer.spec.ts`     | file list, selection, adding, entry file and delete rules                 |
| `tests/components/ConsolePanel.spec.ts`     | message list, level filter, live summary and clearing                     |
| `tests/components/SegmentedTabs.spec.ts`    | ARIA roles and keyboard navigation                                        |
| `tests/components/BaseSwitch.spec.ts`       | the `switch` role and the helper description                              |
| `tests/components/BaseSelect.spec.ts`       | label association and value emission                                      |
| `tests/components/App.spec.ts`              | application structure, mode switching, language switching, axe audit      |

Tests that build a project run in the `node` environment, because esbuild compiled to WebAssembly needs it. The file header declares it with `// @vitest-environment node`.

## Writing rules

- One test verifies one behaviour.
- The test name describes behaviour, not implementation.
- DOM queries rely on roles, labels and text rather than CSS classes.
- Network calls are replaced with stubs. Tests never reach the internet.
- `tests/setup/vitest.setup.ts` provides `matchMedia` and `requestAnimationFrame` stubs and clears local storage before each test.

## Coverage

The report covers files in `src`, excluding the entry point and type-only files. After `npm run test:coverage` the `lcov` report is available in the `coverage` directory.

## Manual checks before a release

1. Walk through the application with the keyboard only, from the skip link to the status bar.
2. Check both themes and both interface languages.
3. Run a program in two different programming languages.
4. Disable the network and confirm the message in runner mode.
5. Check the layout at 320 pixels wide and in a 1440 pixel desktop window.
