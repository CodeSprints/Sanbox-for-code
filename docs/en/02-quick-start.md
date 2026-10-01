# 02 — Quick start

## Requirements

| Tool           | Version          | Needed for                      |
| -------------- | ---------------- | ------------------------------- |
| Node.js        | 20 or newer      | the web edition and all scripts |
| npm            | 10 or newer      | dependency installation         |
| Rust           | 1.77.2 or newer  | desktop and mobile editions     |
| Android Studio | Ladybug or newer | Android releases                |
| Xcode          | 15 or newer      | iOS releases (macOS only)       |

System dependencies for Tauri on Linux, Windows and macOS are listed at `https://tauri.app/start/prerequisites/`.

## Installation

```bash
git clone <repository-url>
cd CodeSandbox
npm install
```

## Run in the browser

```bash
npm run dev
```

The application listens on `http://localhost:1420`. The server accepts connections from the local network, so you can open the same address on a phone.

## Run as a desktop application

```bash
npm run desktop:dev
```

The command starts the Vite server and opens a Tauri window connected to it.

## Run on a phone

```bash
npm run android:init
npm run android:dev
```

For iOS use `npm run ios:init` and `npm run ios:dev`. You run the initialisation once; it creates the `src-tauri/gen` directory.

## Command reference

| Command                 | Effect                                              |
| ----------------------- | --------------------------------------------------- |
| `npm run dev`           | development server with hot module replacement      |
| `npm run build`         | type check and a production web build in `dist`     |
| `npm run preview`       | local preview of the built web edition              |
| `npm run lint`          | ESLint with Vue, TypeScript and accessibility rules |
| `npm run typecheck`     | type check without building                         |
| `npm run test`          | unit and component tests                            |
| `npm run test:coverage` | tests with a coverage report                        |
| `npm run verify`        | lint, types and tests in one step                   |
| `npm run desktop:build` | desktop installers                                  |
| `npm run android:build` | APK or AAB package                                  |
| `npm run ios:build`     | IPA package                                         |

## Configuration

An optional `.env` file points the application at your own execution service:

```ini
VITE_EXECUTION_ENDPOINT=https://your-piston-instance/api/v2/execute
```

Without this variable the application uses the public Piston service at `https://emkc.org/api/v2/piston/execute`.
