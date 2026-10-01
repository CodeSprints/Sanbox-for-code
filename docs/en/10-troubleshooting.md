# 10 — Troubleshooting

## Web preview

| Symptom                         | Cause                                | Fix                                       |
| ------------------------------- | ------------------------------------ | ----------------------------------------- |
| The preview stays empty         | the code threw an error on startup   | read the console panel under the preview  |
| The preview ignores edits       | auto refresh is off                  | enable the switch or press Ctrl + Enter   |
| The build reports a red count   | a file has a syntax or import error  | open that file and read the problem list  |
| An import is not found          | the package is not on the list       | add it in **npm packages**                |
| A package fails to load         | no access to `esm.sh`                | check the network or remove the package   |
| The UI library does not load    | no access to the CDN                 | choose **None** and write your own styles |
| The first build is slow         | the WebAssembly binary is downloading| wait for the first build to finish        |
| The Svelte component is missing | the HTML entry has no `#app` element | add `<div id="app"></div>`                |

## Language runner

| Symptom                            | Cause                             | Fix                                         |
| ---------------------------------- | --------------------------------- | ------------------------------------------- |
| Service unreachable message        | no network or a firewall block    | check the connection and network rules      |
| Too many executions message        | the public Piston rate limit      | wait a moment or point to your own instance |
| The program stops after 20 seconds | the request timeout               | shorten the program or reduce its work      |
| The program sees no input          | the standard input field is empty | type the data into **Standard input**       |
| A library is not found             | no library selected in the catalogue | tick it so the manifest is sent with the code |
| No error is marked in the editor   | the message format is not recognised | read the full text in the console           |

## Build and environment

| Symptom                                   | Cause                                     | Fix                                               |
| ----------------------------------------- | ----------------------------------------- | ------------------------------------------------- |
| `npm run desktop:dev` fails               | missing Tauri system dependencies         | install the packages listed in the Tauri docs     |
| Port 1420 is taken                        | another process is running                | set the `PORT` variable to a free number          |
| `npm run android:dev` cannot find the SDK | `ANDROID_HOME` and `NDK_HOME` are not set | set the environment variables and run again       |
| The phone cannot reach the server         | `TAURI_DEV_HOST` is not set               | provide the local network address of the computer |
| The axe test fails                        | a new element without an accessible name  | add a label or an `aria-label` attribute          |

## Application state

If the application loads in an unexpected state, clear the local storage entries prefixed with `code-sandbox:`. The application returns to its default settings.
