# 07 — Układ responsywny

## Założenia

- Projekt zaczyna się od układu dla małego ekranu. Reguły dla większych ekranów dodajemy wariantem `lg`.
- Nie ma dolnego ograniczenia szerokości. Układ działa od 320 pikseli.
- Zamiast `100vh` używamy `100dvh`, więc pasek adresu w przeglądarce mobilnej nie ucina interfejsu.
- Znacznik `viewport` zawiera `viewport-fit=cover`, co pozwala uwzględnić wcięcie ekranu.

## Punkty graniczne

| Szerokość        | Układ                                                          |
| ---------------- | -------------------------------------------------------------- |
| poniżej 1024 px  | jedna kolumna; przełącznik zakładek wybiera edytory albo wynik |
| 1024 px i więcej | dwie kolumny; edytory i wynik widoczne jednocześnie            |

Punkt graniczny sprawdza funkcja `useMediaQuery` z zapytaniem `(min-width: 1024px)`. Komponenty korzystają z tej samej wartości co klasy Tailwinda, więc układ i logika pozostają spójne.

## Zachowanie elementów

| Element           | Mały ekran                         | Duży ekran                 |
| ----------------- | ---------------------------------- | -------------------------- |
| Nagłówek          | kolumna, elementy zawijają się     | jeden wiersz               |
| Zakładki trybu    | pełna szerokość pod tytułem        | po prawej stronie nagłówka |
| Edytory           | pod sobą, panel wybierany zakładką | lewa kolumna               |
| Podgląd i konsola | panel wybierany zakładką           | prawa kolumna              |
| Pasek stanu       | zawija się do kilku wierszy        | jeden wiersz               |

## Dotyk

- Przyciski i pola mają co najmniej 44 piksele wysokości.
- Odstępy między elementami wynoszą co najmniej 8 pikseli.
- Strona nie blokuje powiększania. Użytkownik może powiększyć widok do 200 procent bez utraty treści.
- Właściwość `overscroll-behavior-y: none` zapobiega przypadkowemu odświeżeniu strony gestem w dół.

## Sprawdzanie

1. Uruchom `npm run dev`.
2. Otwórz narzędzia deweloperskie i włącz tryb urządzenia.
3. Sprawdź szerokości 320, 375, 768, 1024 i 1440 pikseli.
4. Powtórz test w orientacji poziomej.
5. Ustaw powiększenie przeglądarki na 200 procent i sprawdź, czy nie pojawia się przewijanie poziome.
