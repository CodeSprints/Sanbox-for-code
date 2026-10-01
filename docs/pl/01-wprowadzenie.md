# 01 — Wprowadzenie

## Czym jest Code Sandbox

Code Sandbox to edytor kodu z podglądem wyniku. Aplikacja działa w trzech wydaniach: w przeglądarce, na komputerze i na telefonie. Wszystkie wydania powstają z jednego kodu źródłowego.

Aplikacja ma dwa tryby pracy:

1. **Projekt WWW** — edytujesz zestaw plików, aplikacja buduje je w przeglądarce, a wynik widzisz natychmiast w ramce podglądu.
2. **Uruchamianie języków** — piszesz program w jednym z dwunastu języków i wykonujesz go w zdalnej usłudze, a wynik trafia do konsoli.

## Dla kogo

- Osoby uczące się programowania, które chcą szybko sprawdzić fragment kodu.
- Nauczyciele przygotowujący przykłady na zajęcia.
- Programiści, którzy potrzebują szkicownika bez instalowania projektu.

## Główne cechy

| Cecha                 | Opis                                                                             |
| --------------------- | -------------------------------------------------------------------------------- |
| Jeden kod źródłowy    | Ta sama warstwa Vue działa w przeglądarce i w oknie Tauri.                       |
| Wiele typów plików    | HTML, Markdown, EJS, CSS, JSON, JS, MJS, TS, D.TS, JSX, TSX, Vue, Svelte, Rust, Python, C++, C#, Java, Kotlin. |
| Kolorowanie semantyczne | Pakiety językowe CodeMirror 6 i oznaczanie błędów w edytorze.                  |
| Pakiety npm           | Dowolny pakiet z rejestru npm, ładowany przez esm.sh i mapę importów.            |
| Biblioteki językowe   | Dwadzieścia najczęściej używanych bibliotek dla Pythona, C++, Rusta, C#, Javy i Kotlina. |
| Konsola i urządzenia  | Konsola podglądu oraz rozmiary elastyczny, telefon, tablet i komputer.           |
| Dwanaście języków     | Python, TypeScript, JavaScript, C, C++, Go, Rust, Java, Kotlin, Swift, C#, Bash. |
| Dwa języki interfejsu | Polski i angielski, przełączane bez przeładowania strony.                        |
| Motyw                 | Jasny, ciemny lub zgodny z ustawieniem systemu.                                  |
| Dostępność            | Zgodność z WCAG 2.2 na poziomie AA, pełna obsługa klawiatury.                    |
| Praca offline         | Tryb projektu WWW działa bez internetu, jeśli nie dodasz pakietu ani biblioteki z CDN. |

## Stos technologiczny

- **Vue 3** z `<script setup>` i Composition API.
- **TypeScript** w trybie `strict`.
- **Tailwind CSS 4** z tokenami motywu w CSS.
- **Pinia** jako magazyn stanu.
- **Vite 7** jako narzędzie budujące.
- **Tauri 2** jako powłoka desktopowa i mobilna.
- **Vitest**, **Vue Test Utils** i **axe-core** w testach.

## Zasady projektu

- Kod nie zawiera komentarzy. Nazwy funkcji, typów i plików mają wyjaśniać zamiar.
- Logika domenowa jest oddzielona od komponentów i pokryta testami.
- Każdy element interfejsu ma dostępną nazwę i widoczny wskaźnik fokusu.
- Dane użytkownika zostają na urządzeniu. Do sieci wysyłamy tylko kod wskazany do zdalnego wykonania.
