# 10 — Rozwiązywanie problemów

## Podgląd WWW

| Objaw                            | Przyczyna                          | Rozwiązanie                                 |
| -------------------------------- | ---------------------------------- | ------------------------------------------- |
| Podgląd pozostaje pusty          | kod zgłosił błąd przy starcie      | przeczytaj panel konsoli pod podglądem      |
| Podgląd nie reaguje na zmiany    | wyłączone automatyczne odświeżanie | włącz przełącznik lub naciśnij Ctrl + Enter |
| Budowanie pokazuje liczbę błędów | plik ma błąd składni lub importu   | otwórz plik i przeczytaj listę problemów    |
| Import nie został znaleziony     | pakietu nie ma na liście           | dodaj go w panelu **Pakiety npm**           |
| Pakiet się nie ładuje            | brak dostępu do `esm.sh`           | sprawdź sieć lub usuń pakiet                |
| Biblioteka UI się nie ładuje     | brak dostępu do CDN                | wybierz opcję **Brak** i napisz własny styl |
| Pierwsze budowanie trwa długo    | trwa pobieranie pliku WebAssembly  | poczekaj na zakończenie pierwszego budowania |
| Komponent Svelte się nie pojawia | brak elementu `#app` w pliku HTML  | dodaj `<div id="app"></div>`                |

## Uruchamianie języków

| Objaw                                 | Przyczyna                        | Rozwiązanie                                |
| ------------------------------------- | -------------------------------- | ------------------------------------------ |
| Komunikat o niedostępnej usłudze      | brak sieci lub blokada zapory    | sprawdź połączenie i reguły sieci          |
| Komunikat o zbyt wielu uruchomieniach | limit publicznej usługi Piston   | odczekaj chwilę lub wskaż własną instancję |
| Program kończy się po 20 sekundach    | limit czasu żądania              | skróć program lub ogranicz liczbę operacji |
| Program nie widzi danych wejściowych  | puste pole wejścia standardowego | wpisz dane w polu **Wejście standardowe**  |
| Biblioteka nie została znaleziona     | nie zaznaczono jej w katalogu     | zaznacz ją, aby manifest trafił z kodem    |
| Błąd nie jest oznaczony w edytorze    | nieznany format komunikatu        | przeczytaj pełny tekst w konsoli           |

## Budowanie i środowisko

| Objaw                                   | Przyczyna                                  | Rozwiązanie                                             |
| --------------------------------------- | ------------------------------------------ | ------------------------------------------------------- |
| `npm run desktop:dev` kończy się błędem | brak zależności systemowych Tauri          | zainstaluj pakiety opisane w dokumentacji Tauri         |
| Port 1420 jest zajęty                   | działa inny proces                         | ustaw zmienną `PORT` na wolny numer                     |
| `npm run android:dev` nie znajduje SDK  | brak zmiennych `ANDROID_HOME` i `NDK_HOME` | ustaw zmienne środowiskowe i uruchom polecenie ponownie |
| Telefon nie łączy się z serwerem        | brak adresu w zmiennej `TAURI_DEV_HOST`    | podaj adres komputera w sieci lokalnej                  |
| Test axe nie przechodzi                 | nowy element bez dostępnej nazwy           | dodaj etykietę lub atrybut `aria-label`                 |

## Stan aplikacji

Jeśli aplikacja wczyta się w nieoczekiwanym stanie, wyczyść wpisy z przedrostkiem `code-sandbox:` w pamięci lokalnej przeglądarki. Aplikacja wróci do ustawień domyślnych.
