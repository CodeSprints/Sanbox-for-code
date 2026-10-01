# 06 — Dostępność

Celem projektu jest zgodność z WCAG 2.2 na poziomie AA.

## Struktura strony

- Jeden nagłówek `h1` z nazwą aplikacji. Panele mają nagłówki `h2` i `h3`.
- Punkty orientacyjne: `header`, `nav`, `main` i `footer`.
- Pierwszy element w kolejności tabulacji to odnośnik **Przejdź do treści głównej**. Odnośnik jest ukryty do czasu otrzymania fokusu.
- Atrybut `lang` dokumentu zmienia się razem z językiem interfejsu.

## Obsługa klawiatury

| Klawisze                   | Działanie                                             |
| -------------------------- | ----------------------------------------------------- |
| Tab, Shift + Tab           | przejście między elementami                           |
| strzałki w liście zakładek | zmiana trybu pracy lub panelu                         |
| Home, End                  | pierwsza i ostatnia zakładka                          |
| Tab w edytorze             | wstawienie dwóch spacji                               |
| Escape, potem Tab          | opuszczenie edytora                                   |
| Ctrl + Enter, Cmd + Enter  | odświeżenie podglądu lub uruchomienie programu        |
| Ctrl + S, Cmd + S          | to samo co wyżej, bez zapisu pliku przez przeglądarkę |

Pułapka klawiatury nie występuje, ponieważ Escape zwalnia obsługę klawisza Tab w polu edytora.

## Role i nazwy

- Przełącznik trybów używa wzorca `tablist`, `tab` i `tabpanel`. Aktywna zakładka ma `aria-selected="true"` i `tabindex="0"`, pozostałe `tabindex="-1"`.
- Przełącznik automatycznego odświeżania ma rolę `switch` i atrybut `aria-checked`.
- Każde pole formularza ma etykietę połączoną atrybutem `for`.
- Podpowiedzi i liczniki są powiązane z polem przez `aria-describedby`.
- Ramka podglądu ma atrybut `title` z opisem zawartości.

## Komunikaty dynamiczne

| Zdarzenie                   | Sposób ogłoszenia             |
| --------------------------- | ----------------------------- |
| odświeżenie podglądu        | obszar `aria-live="polite"`   |
| kopiowanie do schowka       | obszar `aria-live="polite"`   |
| wynik uruchomienia programu | konsola z rolą `log`          |
| trwające uruchomienie       | atrybut `aria-busy` przycisku |

## Kontrast i czytelność

- Kolory motywu zapisano w przestrzeni `oklch`. Pary tekstu i tła spełniają wymaganie kontrastu 4,5:1 dla tekstu zwykłego i 3:1 dla tekstu dużego.
- Motyw jasny i ciemny mają osobne wartości tokenów.
- Interfejs nie przekazuje informacji wyłącznie kolorem. Stan błędu opisuje także tekst.

## Fokus i ruch

- Każdy element interaktywny ma widoczny kontur fokusu o grubości 3 pikseli i odstępie 2 pikseli.
- Elementy dotykowe mają co najmniej 44 piksele wysokości, zgodnie z kryterium 2.5.8.
- Reguła `prefers-reduced-motion` wyłącza animacje i przejścia.
- Preferencja `color-scheme` przekazuje systemowi informację o motywie.

## Weryfikacja

Plik `tests/components/App.spec.ts` uruchamia `axe-core` na pełnym drzewie aplikacji z zestawami reguł `wcag2a`, `wcag2aa`, `wcag21a` i `wcag21aa`. Test nie przechodzi, jeśli pojawi się choć jedno naruszenie.

ESLint używa wtyczki `eslint-plugin-vuejs-accessibility`, która wychwytuje typowe błędy już w trakcie pisania kodu.

Testy automatyczne nie zastępują sprawdzenia ręcznego. Przed wydaniem przejdź aplikację samą klawiaturą i sprawdź ją w czytniku ekranu.
