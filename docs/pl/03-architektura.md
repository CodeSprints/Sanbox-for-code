# 03 — Architektura

## Warstwy

Aplikacja ma cztery warstwy. Każda warstwa zna tylko warstwy poniżej siebie.

```
komponenty Vue        widok i interakcja
      ↓
magazyny Pinia        stan sesji i reguły trybów
      ↓
moduły domenowe       budowanie dokumentu, wykonanie kodu
      ↓
warstwa platformy     pamięć lokalna, schowek, wykrywanie środowiska
```

Dzięki temu podziałowi logika domenowa nie zależy od Vue, a kod platformy nie zależy od interfejsu.

## Drzewo katalogów

```
src/
  components/        komponenty interfejsu (.vue)
  composables/       funkcje wielokrotnego użytku: motyw, media query, skróty
  features/
    languages/       rejestr języków, pakiety CodeMirror, diagnostyka
    web-playground/  model projektu, szablony, bundler, klient rejestru npm,
                     renderery znaczników, generator dokumentu podglądu
    code-runner/     katalog języków, katalogi bibliotek, manifesty,
                     klient usługi wykonywania, parser wyniku
  i18n/              słowniki pl i en oraz funkcja tłumacząca
  platform/          wykrywanie środowiska, pamięć lokalna, schowek
  stores/            magazyny Pinia
  styles/            warstwa Tailwind i tokeny motywu
  types/             typy wspólne dla aplikacji
src-tauri/           powłoka Rust dla desktopu i urządzeń mobilnych
tests/               testy jednostkowe i testy komponentów
docs/                dokumentacja w języku polskim i angielskim
```

## Przepływ danych w trybie podglądu WWW

1. Użytkownik pisze w edytorze aktywnego pliku.
2. Komponent aktualizuje projekt w magazynie `web-playground`.
3. Magazyn zapisuje projekt w pamięci lokalnej i czeka 450 ms.
4. Po tym czasie `buildPreview` odczytuje plik wejściowy. Dla pliku HTML wywołuje `bundleEntry` dla każdego dołączonego skryptu, dla Markdown wywołuje `renderMarkdown`, dla EJS wywołuje `renderEjs`.
5. `bundleEntry` uruchamia esbuild skompilowany do WebAssembly. Wtyczka rozwiązuje importy wewnątrz projektu, kompiluje pliki Vue i Svelte oraz pozostawia importy nazwane jako zewnętrzne.
6. Generator dołącza zebrany CSS, znaczniki biblioteki UI, mapę importów zależności npm i mostek konsoli do sekcji `head` dokumentu.
7. Ramka `<iframe>` z atrybutem `srcdoc` otrzymuje nowy dokument.
8. Mostek wysyła komunikaty konsoli i błędy przez `postMessage`, a magazyn dopisuje je do historii konsoli.
9. Diagnostyka budowania jest przechowywana osobno dla każdego pliku i trafia do edytora jako znaczniki błędów.

Ramka działa w piaskownicy `allow-scripts allow-modals allow-forms allow-popups`. Nie ma dostępu do źródła aplikacji, więc kod użytkownika nie odczyta jej danych.

## Przepływ danych w trybie uruchamiania języków

1. Użytkownik wybiera język i pisze kod. Magazyn `code-runner` trzyma osobny kod dla każdego języka.
2. Przycisk **Uruchom** wywołuje `runCode`.
3. `runCode` wysyła żądanie do usługi Piston z limitem czasu 20 sekund.
4. Zaznaczone biblioteki tworzą plik manifestu, który jest wysyłany obok pliku źródłowego.
5. Odpowiedź zawiera etap kompilacji i etap uruchomienia. Moduł łączy oba wyjścia.
6. Magazyn zapisuje wynik, kod wyjścia i czas trwania, a widok wypisuje je w konsoli.
7. `parseOutputDiagnostics` zamienia komunikaty kompilatorów i środowisk uruchomieniowych na znaczniki w edytorze.

Każde uruchomienie można przerwać. Magazyn używa `AbortController`, więc przerwanie zamyka połączenie.

## Jeden kod dla trzech platform

Warstwa interfejsu nie wie, gdzie działa. Różnice zamyka moduł `src/platform/runtime.ts`:

| Funkcja               | Przeglądarka          | Tauri                                         |
| --------------------- | --------------------- | --------------------------------------------- |
| `isTauri`             | `false`               | `true`                                        |
| `detectPlatform`      | `browser`             | `windows`, `macos`, `linux`, `android`, `ios` |
| `detectRuntimeTarget` | `web`                 | `desktop` lub `mobile`                        |
| `copyToClipboard`     | `navigator.clipboard` | wtyczka `clipboard-manager`                   |

Wtyczka Tauri ładuje się dynamicznie, więc kod przeglądarkowy nie pobiera jej kodu.

## Stan i jego trwałość

| Klucz w pamięci lokalnej       | Zawartość                             |
| ------------------------------ | ------------------------------------- |
| `code-sandbox:web-workspace`   | projekt trybu WWW                     |
| `code-sandbox:web-auto-run`    | ustawienie automatycznego odświeżania |
| `code-sandbox:runner-language` | ostatnio wybrany język                |
| `code-sandbox:runner-sources`  | kod dla każdego języka                |
| `code-sandbox:runner-libraries`| wybrane biblioteki dla języka         |
| `code-sandbox:theme`           | wybrany motyw                         |
| `code-sandbox:locale`          | język interfejsu                      |
| `code-sandbox:mode`            | aktywny tryb pracy                    |

Odczyt zawsze przechodzi przez funkcję strażnika typu. Uszkodzony wpis nie psuje aplikacji — moduł zwraca wartość domyślną.

## Rozmiar paczki

esbuild, kompilator Vue i kompilator Svelte są importowane dynamicznie. Pierwsze budowanie podglądu pobiera plik WebAssembly oraz kompilator języka używanego w projekcie; projekt bez plików Vue nigdy nie pobiera kompilatora Vue.
