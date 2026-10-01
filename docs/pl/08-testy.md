# 08 — Testy

## Narzędzia

| Narzędzie      | Zastosowanie                               |
| -------------- | ------------------------------------------ |
| Vitest         | wykonywanie testów w środowisku jsdom      |
| Vue Test Utils | montowanie komponentów i symulacja zdarzeń |
| axe-core       | automatyczny audyt dostępności             |
| Coverage V8    | raport pokrycia kodu                       |

## Uruchamianie

```bash
npm run test
npm run test:watch
npm run test:coverage
npm run verify
```

Polecenie `npm run verify` wykonuje kolejno lint, sprawdzenie typów i testy. Używa go także proces CI.

## Zakres testów

| Plik                                        | Co sprawdza                                                                  |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `tests/unit/registry.spec.ts`               | rozpoznawanie rozszerzeń dla wszystkich obsługiwanych języków                |
| `tests/unit/workspace.spec.ts`              | operacje na plikach, normalizację ścieżek, importy i brakujące zależności    |
| `tests/unit/bundler.spec.ts`                | budowanie przez esbuild: TypeScript, TSX, JSON, CSS, Vue, Svelte, błędy      |
| `tests/unit/document-builder.spec.ts`       | pliki wejściowe HTML, Markdown i EJS, mapę importów, mostek i diagnostykę    |
| `tests/unit/dependencies.spec.ts`           | adresy esm.sh, mapę importów, wyszukiwanie w rejestrze i odczyt wersji       |
| `tests/unit/markup.spec.ts`                 | renderowanie Markdown, ucieczkę HTML i silnik EJS                            |
| `tests/unit/libraries.spec.ts`              | dwadzieścia bibliotek dla języka i każdy generowany manifest                 |
| `tests/unit/output-diagnostics.spec.ts`     | analizę wyniku gcc, MSBuild, rustc, Pythona, javac i kompilatora Kotlina     |
| `tests/unit/runner.spec.ts`                 | format żądania do usługi, scalanie wyjścia i mapowanie błędów                |
| `tests/unit/i18n.spec.ts`                   | zgodność kluczy w słownikach, podstawianie parametrów                        |
| `tests/unit/storage.spec.ts`                | zapis, odczyt, strażniki typów i brak pamięci lokalnej                       |
| `tests/unit/runtime.spec.ts`                | wykrywanie przeglądarki, desktopu i urządzenia mobilnego                     |
| `tests/unit/web-playground-store.spec.ts`   | operacje na plikach i zależnościach, budowanie z opóźnieniem, konsolę        |
| `tests/unit/code-runner-store.spec.ts`      | stany uruchomienia, przerwanie, kod i biblioteki osobno dla języka           |
| `tests/components/CodeMirrorEditor.spec.ts` | treść dokumentu, nazwę dostępną, aktualizacje modelu i znaczniki błędów      |
| `tests/components/FileExplorer.spec.ts`     | listę plików, wybór, dodawanie, plik wejściowy i zasady usuwania             |
| `tests/components/ConsolePanel.spec.ts`     | listę komunikatów, filtr poziomów, podsumowanie i czyszczenie                |
| `tests/components/SegmentedTabs.spec.ts`    | role ARIA i nawigację klawiaturą                                             |
| `tests/components/BaseSwitch.spec.ts`       | rolę `switch` i opis pomocniczy                                              |
| `tests/components/BaseSelect.spec.ts`       | powiązanie etykiety z listą i emisję wartości                                |
| `tests/components/App.spec.ts`              | strukturę aplikacji, zmianę trybu, zmianę języka i audyt axe                 |

Testy budujące projekt działają w środowisku `node`, ponieważ wymaga tego esbuild skompilowany do WebAssembly. Nagłówek pliku deklaruje to wpisem `// @vitest-environment node`.

## Zasady pisania testów

- Jeden test sprawdza jedno zachowanie.
- Nazwa testu opisuje zachowanie, nie implementację.
- Zapytania do drzewa DOM opierają się na rolach, etykietach i tekście, a nie na klasach CSS.
- Żądania sieciowe są zastępowane atrapą. Testy nie łączą się z internetem.
- Plik `tests/setup/vitest.setup.ts` dostarcza atrapy `matchMedia` i `requestAnimationFrame` oraz czyści pamięć lokalną przed każdym testem.

## Pokrycie

Raport obejmuje pliki z katalogu `src`, z pominięciem punktu wejścia i plików typów. Po uruchomieniu `npm run test:coverage` raport w formacie `lcov` znajdziesz w katalogu `coverage`.

## Testy ręczne przed wydaniem

1. Przejdź aplikację samą klawiaturą od odnośnika pomijającego do paska stanu.
2. Sprawdź oba motywy i oba języki interfejsu.
3. Uruchom program w dwóch różnych językach programowania.
4. Wyłącz sieć i sprawdź komunikat w trybie uruchamiania.
5. Sprawdź układ na szerokości 320 pikseli oraz w oknie desktopowym 1440 pikseli.
