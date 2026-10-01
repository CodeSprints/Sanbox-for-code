# 09 — Rozwój i wydania

## Standardy kodu

| Zasada                                    | Uzasadnienie                                                     |
| ----------------------------------------- | ---------------------------------------------------------------- |
| Brak komentarzy w kodzie                  | nazwy mają wyjaśniać zamiar; komentarz szybko się dezaktualizuje |
| `<script setup>` i TypeScript             | krótszy zapis i pełne typowanie propsów oraz zdarzeń             |
| Kolejność bloków: script, template, style | spójny układ każdego pliku `.vue`                                |
| Import typów przez `import type`          | mniejszy pakiet wynikowy                                         |
| `strict` w TypeScripcie                   | brak cichych błędów typów                                        |
| Logika domenowa poza komponentami         | łatwiejsze testy i ponowne użycie                                |

## Narzędzia jakości

```bash
npm run lint
npm run format
npm run typecheck
npm run test
npm run verify
```

ESLint łączy reguły zalecane dla JavaScriptu, Vue, TypeScriptu i dostępności oraz integrację z Prettierem. Konfiguracja nie dopuszcza ostrzeżeń: `npm run lint` używa opcji `--max-warnings 0`.

## Przebieg pracy

1. Utwórz gałąź dla zmiany.
2. Wprowadź zmianę wraz z testami.
3. Uruchom `npm run verify`.
4. Przygotuj opis zmiany i otwórz żądanie scalenia.
5. Po przeglądzie scal zmianę do gałęzi głównej.

## Ciągła integracja

Plik `ci/github-actions-ci.yml` opisuje przepływ pracy. Skopiuj go do `.github/workflows/ci.yml`, aby go włączyć. Uruchamia on dwa zadania:

| Zadanie   | Kroki                                                                    |
| --------- | ------------------------------------------------------------------------ |
| `quality` | instalacja zależności, lint, sprawdzenie typów, testy, budowa wersji WWW |
| `desktop` | budowa aplikacji Tauri na Ubuntu, Windowsie i macOS                      |

Zadanie `desktop` instaluje zależności systemowe Linuksa i korzysta z pamięci podręcznej Cargo.

## Wersjonowanie

Numer wersji występuje w trzech miejscach i musi być taki sam:

- `package.json`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`

Stosujemy wersjonowanie semantyczne: zmiana łamiąca zgodność zwiększa numer główny, nowa funkcja numer pomocniczy, poprawka numer poprawki.

## Lista kontrolna wydania

1. Zaktualizuj numer wersji w trzech plikach.
2. Uruchom `npm run verify`.
3. Zbuduj wersję WWW i instalatory desktopowe.
4. Sprawdź aplikację ręcznie według listy z dokumentu o testach.
5. Oznacz wydanie etykietą w repozytorium i dołącz pliki instalatorów.
