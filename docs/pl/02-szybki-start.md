# 02 — Szybki start

## Wymagania

| Narzędzie      | Wersja             | Potrzebne do                     |
| -------------- | ------------------ | -------------------------------- |
| Node.js        | 20 lub nowsza      | wersji WWW i wszystkich skryptów |
| npm            | 10 lub nowsza      | instalacji zależności            |
| Rust           | 1.77.2 lub nowsza  | wersji desktopowej i mobilnej    |
| Android Studio | Ladybug lub nowsze | wydania na Androida              |
| Xcode          | 15 lub nowszy      | wydania na iOS (tylko macOS)     |

Zależności systemowe Tauri dla Linuksa, Windowsa i macOS opisuje strona `https://tauri.app/start/prerequisites/`.

## Instalacja

```bash
git clone <adres-repozytorium>
cd CodeSandbox
npm install
```

## Uruchomienie w przeglądarce

```bash
npm run dev
```

Aplikacja nasłuchuje na `http://localhost:1420`. Serwer akceptuje połączenia z sieci lokalnej, więc możesz otworzyć ten sam adres na telefonie.

## Uruchomienie jako aplikacja desktopowa

```bash
npm run desktop:dev
```

Polecenie startuje serwer Vite i otwiera okno Tauri podłączone do tego serwera.

## Uruchomienie na telefonie

```bash
npm run android:init
npm run android:dev
```

Dla iOS użyj `npm run ios:init` oraz `npm run ios:dev`. Inicjalizację wykonujesz raz; tworzy ona katalog `src-tauri/gen`.

## Zestaw poleceń

| Polecenie               | Działanie                                           |
| ----------------------- | --------------------------------------------------- |
| `npm run dev`           | serwer deweloperski z podmianą modułów              |
| `npm run build`         | sprawdzenie typów i produkcyjna wersja WWW w `dist` |
| `npm run preview`       | lokalny podgląd zbudowanej wersji WWW               |
| `npm run lint`          | ESLint z regułami Vue, TypeScript i dostępności     |
| `npm run typecheck`     | sprawdzenie typów bez budowania                     |
| `npm run test`          | testy jednostkowe i komponentów                     |
| `npm run test:coverage` | testy wraz z raportem pokrycia                      |
| `npm run verify`        | lint, typy i testy w jednym kroku                   |
| `npm run desktop:build` | instalatory desktopowe                              |
| `npm run android:build` | pakiet APK lub AAB                                  |
| `npm run ios:build`     | pakiet IPA                                          |

## Konfiguracja

Opcjonalny plik `.env` pozwala wskazać własną usługę wykonywania kodu:

```ini
VITE_EXECUTION_ENDPOINT=https://twoja-instancja-piston/api/v2/execute
```

Bez tej zmiennej aplikacja korzysta z publicznej usługi Piston pod adresem `https://emkc.org/api/v2/piston/execute`.
