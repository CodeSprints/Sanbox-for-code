# 04 — Funkcje

## Tryb projektu WWW

### Lista plików

Projekt to lista plików. Panel po lewej stronie pokazuje wszystkie pliki, oznacza plik wejściowy etykietą i wyświetla liczbę błędów budowania obok nazwy pliku. Przycisk **Nowy plik** pyta o nazwę, a menu akcji każdego wiersza pozwala zmienić nazwę, ustawić plik jako wejściowy i usunąć plik. Pliku wejściowego nie można usunąć.

O sposobie obsługi pliku decyduje rozszerzenie. Obsługiwane rozszerzenia:

| Grupa    | Rozszerzenia                                            |
| -------- | ------------------------------------------------------- |
| Znaczniki| `.html`, `.htm`, `.ejs`, `.md`, `.markdown`             |
| Style    | `.css`                                                  |
| Dane     | `.json`                                                 |
| Skrypty  | `.js`, `.mjs`, `.cjs`, `.jsx`, `.ts`, `.mts`, `.cts`, `.d.ts`, `.tsx`, `.vue`, `.svelte` |
| Programy | `.rs`, `.py`, `.cpp`, `.cc`, `.hpp`, `.cs`, `.java`, `.kt`, `.kts`, `.sh` |

### Edytor

Edytorem jest CodeMirror 6. Każdy plik dostaje pakiet językowy zgodny z rozszerzeniem, więc kolorowanie jest semantyczne: słowa kluczowe, typy, funkcje, właściwości, znaczniki, atrybuty, łańcuchy i komentarze korzystają z osobnych tokenów motywu, które zmieniają się razem z motywem jasnym i ciemnym.

| Funkcja            | Opis                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| Kolorowanie        | tokeny semantyczne z parsera języka, a nie wyrażenia regularne       |
| Oznaczanie błędów  | błędy parsera i błędy budowania w marginesie oraz pod tekstem        |
| Numery wierszy     | z podświetleniem aktywnego wiersza i zwijaniem kodu                  |
| Nawiasy            | automatyczne domykanie i podświetlanie pary                          |
| Podpowiedzi        | z pakietu językowego i z treści dokumentu                            |
| Wyszukiwanie       | Ctrl + F wewnątrz edytora                                            |
| Klawiatura         | Tab wstawia wcięcie, Escape zwalnia Tab, aby można było opuścić pole |

Pod edytorem znajduje się lista problemów aktywnego pliku z numerem wiersza, kolumną i komunikatem. Gdy plik jest poprawny, lista informuje o braku problemów.

### Szablony

| Szablon                | Plik wejściowy | Zawartość                                        |
| ---------------------- | -------------- | ------------------------------------------------ |
| Vanilla TypeScript     | `index.html`   | HTML, CSS i moduły TypeScript                    |
| React + TSX            | `index.html`   | `App.tsx` z automatycznym środowiskiem JSX       |
| Vue single file        | `index.html`   | `App.vue` ze `<script setup>` i stylami scoped   |
| Svelte                 | `index.html`   | `App.svelte` kompilowany w przeglądarce          |
| Dokument Markdown      | `readme.md`    | dokument renderowany do HTML                     |
| Szablon EJS            | `page.ejs`     | szablon z danymi w pliku `data.json`             |

Wybór szablonu zastępuje cały projekt.

### Budowanie

Podgląd jest budowany w przeglądarce przez esbuild skompilowany do WebAssembly. Mechanizm rozwiązuje importy względne wewnątrz projektu, kompiluje TypeScript, JSX i TSX, kompiluje komponenty Vue przy pomocy `@vue/compiler-sfc`, komponenty Svelte przy pomocy kompilatora Svelte, importuje pliki JSON jako moduły i zbiera CSS importowany z modułów.

Dla pliku wejściowego HTML znacznik `<link rel="stylesheet">` jest zastępowany treścią pliku, a `<script src>` zbudowanym modułem. Plik wejściowy Markdown jest renderowany przez `marked`. Plik wejściowy EJS renderuje wbudowany silnik szablonów, który pobiera dane z pliku `data.json`.

Błędy budowania pojawiają się w trzech miejscach: w edytorze pliku, który je wywołał, jako liczba obok nazwy pliku oraz w wierszu stanu nad podglądem.

### Pakiety npm

Panel **Pakiety npm** przyjmuje dowolny pakiet z rejestru npm. Można wpisać nazwę i wersję albo wyszukać pakiet w rejestrze i dodać wynik. Jeżeli kod importuje pakiet spoza listy, panel proponuje dodanie go w najnowszej wersji.

Pakiety są ładowane z `https://esm.sh`. Dokument podglądu zawiera mapę importów, która kieruje każdą zależność do tej sieci i oznacza pozostałe zależności jako zewnętrzne, dzięki czemu wszystkie moduły korzystają z jednej kopii biblioteki. Importy nazwane pozostają w paczce bez zmian, a przeglądarka rozwiązuje je przez mapę importów.

### Biblioteki UI

Lista zawiera Tailwind CSS 4, Bootstrap 5, Bulmę, Pico.css, Water.css, Font Awesome i Animate.css. Wybrana biblioteka jest dołączana do sekcji `head` dokumentu podglądu. Opcja **Brak** pozostawia dokument bez zewnętrznych zasobów stylów.

### Podgląd i urządzenia

Podgląd to element `<iframe>` w trybie sandbox wypełniany przez `srcdoc`. Lista rozmiarów nad ramką obejmuje cztery przypadki:

| Ustawienie | Rozmiar     | Zastosowanie       |
| ---------- | ----------- | ------------------ |
| Elastyczny | pełna szerokość | układ responsywny |
| Telefon    | 390 × 844   | telefon            |
| Tablet     | 820 × 1180  | tablet             |
| Komputer   | 1280 × 800  | komputer           |

Przycisk **Obróć** zamienia szerokość z wysokością, co pozwala sprawdzić orientację poziomą. Bieżąca orientacja jest podana tekstem obok ramki.

### Konsola

Dokument podglądu zawiera mostek, który opakowuje `console.log`, `console.info`, `console.warn`, `console.error` i `console.debug` oraz nasłuchuje zdarzeń `error` i `unhandledrejection`. Każdy komunikat trafia do aplikacji przez `postMessage` i pojawia się w panelu konsoli z czasem i poziomem.

Panel filtruje komunikaty według poziomu, zlicza błędy, ostrzeżenia i komunikaty w obszarze aktywnym, a przycisk **Wyczyść konsolę** opróżnia listę. Historia obejmuje 200 ostatnich wpisów.

### Odświeżanie

Przełącznik **Auto odświeżanie** przebudowuje projekt 450 ms po ostatniej zmianie. Przy wyłączonym przełączniku podgląd aktualizuje przycisk **Uruchom** lub skrót Ctrl + Enter (Cmd + Enter w systemie macOS).

### Kopiowanie dokumentu

Przycisk **Kopiuj dokument** zapisuje pełny zbudowany dokument HTML do schowka. W przeglądarce korzysta z `navigator.clipboard`, w aplikacji Tauri z wtyczki schowka. Wynik jest ogłaszany przez obszar `aria-live`.

## Tryb uruchamiania języków

### Wybór języka

Lista zawiera dwanaście języków: Python, TypeScript, JavaScript, C, C++, Go, Rust, Javę, Kotlin, Swift, C# i Bash. Każdy ma własny szablon startowy i nazwę pliku. Kod źródłowy jest pamiętany osobno dla każdego języka, więc zmiana języka nie kasuje wcześniejszej pracy.

### Katalog bibliotek

Sześć języków ma katalog dwudziestu najczęściej używanych bibliotek:

| Język  | Manifest wysyłany z programem | Przykłady                            |
| ------ | ----------------------------- | ------------------------------------ |
| Python | `requirements.txt`            | NumPy, pandas, Requests, FastAPI     |
| C++    | `vcpkg.json`                  | Boost, fmt, spdlog, Eigen            |
| Rust   | `Cargo.toml`                  | serde, tokio, clap, reqwest          |
| C#     | `sandbox.csproj`              | Newtonsoft.Json, Serilog, Dapper     |
| Java   | `pom.xml`                     | Guava, Jackson, JUnit, Spring Boot   |
| Kotlin | `build.gradle.kts`            | kotlinx.coroutines, Ktor, Exposed    |

Zaznaczenie biblioteki dodaje jej wpis do manifestu, a wygenerowany manifest jest widoczny w panelu i wysyłany razem z programem. Przycisk **Wstaw** obok biblioteki dodaje jej wiersz importu na początku pliku źródłowego.

### Wejście standardowe

Pole **Wejście standardowe** przekazuje tekst do programu przez `stdin`. Pole jest opcjonalne.

### Uruchamianie

Przycisk **Uruchom** wysyła kod i manifest do usługi Piston. W czasie pracy przycisk ma atrybut `aria-busy`, a obok pojawia się przycisk **Anuluj**. Żądanie jest przerywane po 20 sekundach.

### Błędy w wyniku

Komunikaty kompilatorów i środowisk uruchomieniowych są analizowane i zamieniane na znaczniki w edytorze. Parser rozpoznaje formaty gcc i clang, MSBuild i kompilatora C#, rustc, ślady wyjątków Pythona, javac oraz kompilatora Kotlina. Rozpoznany komunikat oznacza wiersz w edytorze, a pełna treść pozostaje w konsoli.

### Konsola

Konsola ma rolę `log` i atrybut `aria-live="polite"`. Po zakończeniu pracy pokazuje jeden z komunikatów:

| Stan              | Komunikat                        |
| ----------------- | -------------------------------- |
| sukces            | czas wykonania i kod wyjścia     |
| niepowodzenie     | kod wyjścia programu             |
| anulowanie        | informacja o przerwaniu          |
| problem sieciowy  | prośba o sprawdzenie połączenia  |
| limit zapytań     | prośba o odczekanie chwili       |

## Ustawienia wspólne

| Ustawienie | Wartości                          | Zapamiętywane |
| ---------- | --------------------------------- | ------------- |
| Tryb       | projekt WWW, uruchamianie języków | tak           |
| Motyw      | systemowy, jasny, ciemny          | tak           |
| Język      | polski, angielski                 | tak           |

Pasek stanu na dole pokazuje wydanie, nazwę platformy i stan sieci.
