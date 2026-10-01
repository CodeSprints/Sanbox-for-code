# 09 — Development and releases

## Code standards

| Rule                                 | Reason                                             |
| ------------------------------------ | -------------------------------------------------- |
| No comments in code                  | names carry the intent; comments go stale quickly  |
| `<script setup>` and TypeScript      | shorter syntax and full typing of props and events |
| Block order: script, template, style | a consistent layout in every `.vue` file           |
| Type imports via `import type`       | a smaller output bundle                            |
| TypeScript `strict`                  | no silent type errors                              |
| Domain logic outside components      | easier testing and reuse                           |

## Quality tooling

```bash
npm run lint
npm run format
npm run typecheck
npm run test
npm run verify
```

ESLint combines the recommended rules for JavaScript, Vue, TypeScript and accessibility with the Prettier integration. The configuration allows no warnings: `npm run lint` uses `--max-warnings 0`.

## Workflow

1. Create a branch for the change.
2. Implement the change together with tests.
3. Run `npm run verify`.
4. Write the change description and open a pull request.
5. Merge into the main branch after review.

## Continuous integration

`ci/github-actions-ci.yml` defines the workflow. Copy it to `.github/workflows/ci.yml` to enable it. It runs two jobs:

| Job       | Steps                                                    |
| --------- | -------------------------------------------------------- |
| `quality` | install dependencies, lint, type check, tests, web build |
| `desktop` | build the Tauri application on Ubuntu, Windows and macOS |

The `desktop` job installs Linux system dependencies and uses the Cargo cache.

## Versioning

The version number appears in three places and must match:

- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

The project uses semantic versioning: a breaking change raises the major number, a new feature the minor number, a fix the patch number.

## Release checklist

1. Update the version number in the three files.
2. Run `npm run verify`.
3. Build the web edition and the desktop installers.
4. Check the application manually using the list in the testing document.
5. Tag the release in the repository and attach the installer files.
