# 05 — Platforms

## The single codebase rule

All logic and the whole interface live in the `src` directory. Tauri does not copy that code — it packages the built `dist` directory into an application window. Because of that, every fix lands in all editions at once.

| Edition | Shell                            | Build output                        |
| ------- | -------------------------------- | ----------------------------------- |
| Web     | browser                          | static files in `dist`              |
| Desktop | Tauri 2 with the system WebView  | `.msi`, `.dmg`, `.deb`, `.AppImage` |
| Android | Tauri 2 with the Android WebView | `.apk` or `.aab`                    |
| iOS     | Tauri 2 with WKWebView           | `.ipa`                              |

## Web edition

```bash
npm run build
npm run preview
```

The `dist` directory contains static files. You can publish them on any file server. The application needs no application server, because it has no backend of its own.

## Desktop edition

```bash
npm run desktop:build
```

Installers appear in `src-tauri/target/release/bundle`. Build on the target system: Windows for `.msi`, macOS for `.dmg`, Linux for `.deb` and `.AppImage`.

The window has a minimum size of 360 × 480 pixels, so the responsive layout also works in a small window. The `window-state` plugin remembers window size and position between runs.

## Android edition

```bash
npm run android:init
npm run android:build
```

Set the `ANDROID_HOME` and `NDK_HOME` variables before the first run. Package signing is configured in `src-tauri/gen/android`.

## iOS edition

```bash
npm run ios:init
npm run ios:build
```

macOS with Xcode and an Apple developer account are required. The signing profile is set in the project under `src-tauri/gen/apple`.

## Testing on a device in the local network

```bash
TAURI_DEV_HOST=192.168.0.10 npm run android:dev
```

`TAURI_DEV_HOST` sets the Vite server address visible to the phone. The development server listens on `0.0.0.0`, so a device in the same network connects without extra configuration.

## Content security policy

`src-tauri/tauri.conf.json` sets the CSP header. Only the resources the application actually uses are allowed:

| Directive     | Allowed sources                                           |
| ------------- | --------------------------------------------------------- |
| `script-src`  | own files, `cdn.jsdelivr.net`, `esm.sh`                   |
| `connect-src` | the IPC channel, `emkc.org`, `cdn.jsdelivr.net`, `esm.sh` |
| `frame-src`   | own files, `blob:`, `data:`                               |

Tauri permissions are declared in `src-tauri/capabilities/default.json`. The application only asks to read system information and to write text to the clipboard.
