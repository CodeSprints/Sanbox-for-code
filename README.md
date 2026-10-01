# Code Sandbox

Edytor kodu z podglądem na żywo dla przeglądarki, komputera i telefonu — jeden kod źródłowy, trzy wydania.

A live code playground for web, desktop and mobile — one codebase, three editions.

## Stack

Vue 3 · TypeScript · Tailwind CSS 4 · Pinia · Vite 7 · Tauri 2 · Vitest · axe-core

## Szybki start / Quick start

```bash
npm install
npm run dev           # http://localhost:1420
npm run desktop:dev   # okno Tauri / Tauri window
npm run android:dev   # Android (po npm run android:init)
npm run verify        # lint + typy + testy / lint + types + tests
```

## Funkcje / Features

| PL                                                   | EN                                                |
| ---------------------------------------------------- | ------------------------------------------------- |
| Projekt wielu plików budowany w przeglądarce         | Multi-file project built in the browser           |
| HTML, Markdown, EJS, CSS, JSON, TS, TSX, Vue, Svelte | HTML, Markdown, EJS, CSS, JSON, TS, TSX, Vue, Svelte |
| Kolorowanie semantyczne i oznaczanie błędów          | Semantic highlighting and error marking           |
| Dowolny pakiet npm przez esm.sh                      | Any npm package through esm.sh                    |
| Konsola podglądu i rozmiary telefon, tablet, komputer | Preview console and phone, tablet, desktop sizes |
| Siedem bibliotek UI do wyboru                        | Seven optional UI libraries                       |
| Uruchamianie programów w dwunastu językach           | Program execution in twelve languages             |
| Po dwadzieścia bibliotek dla C++, C#, Rusta, Pythona, Javy i Kotlina | Twenty libraries each for C++, C#, Rust, Python, Java and Kotlin |
| Interfejs po polsku i angielsku                      | Polish and English interface                      |
| Motyw jasny, ciemny i systemowy                      | Light, dark and system theme                      |
| Zgodność z WCAG 2.2 AA                               | WCAG 2.2 AA conformance                           |
| Układ responsywny od 320 pikseli                     | Responsive layout from 320 pixels                 |

## Dokumentacja / Documentation

Pełna dokumentacja w języku polskim i angielskim: [`docs/README.md`](docs/README.md).

Full documentation in Polish and English: [`docs/README.md`](docs/README.md).

## Struktura / Structure

```
src/           aplikacja Vue / the Vue application
ci/            przepływ CI do skopiowania / CI workflow to copy
src-tauri/     powłoka Rust / the Rust shell
tests/         testy / tests
docs/          dokumentacja / documentation
```

## Licencja / License

MIT
