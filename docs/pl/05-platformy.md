# 05 — Platformy

## Zasada jednego kodu

Cała logika i cały interfejs mieszczą się w katalogu `src`. Tauri nie kopiuje tego kodu — pakuje zbudowany katalog `dist` do okna aplikacji. Z tego powodu każda poprawka działa jednocześnie we wszystkich wydaniach.

| Wydanie | Powłoka                      | Wynik budowania                     |
| ------- | ---------------------------- | ----------------------------------- |
| WWW     | przeglądarka                 | statyczne pliki w `dist`            |
| Desktop | Tauri 2 z WebView systemowym | `.msi`, `.dmg`, `.deb`, `.AppImage` |
| Android | Tauri 2 z WebView Androida   | `.apk` lub `.aab`                   |
| iOS     | Tauri 2 z WKWebView          | `.ipa`                              |

## Wydanie WWW

```bash
npm run build
npm run preview
```

Katalog `dist` zawiera pliki statyczne. Możesz je opublikować na dowolnym serwerze plików. Aplikacja nie wymaga serwera aplikacyjnego, ponieważ nie ma własnego zaplecza.

## Wydanie desktopowe

```bash
npm run desktop:build
```

Instalatory trafiają do `src-tauri/target/release/bundle`. Budowanie wykonuj na systemie docelowym: Windows dla `.msi`, macOS dla `.dmg`, Linux dla `.deb` i `.AppImage`.

Okno ma minimalny rozmiar 360 × 480 pikseli, więc układ responsywny działa także po zmniejszeniu okna. Wtyczka `window-state` zapamiętuje rozmiar i położenie okna między uruchomieniami.

## Wydanie na Androida

```bash
npm run android:init
npm run android:build
```

Przed pierwszym uruchomieniem ustaw zmienne `ANDROID_HOME` i `NDK_HOME`. Podpis pakietu konfigurujesz w `src-tauri/gen/android`.

## Wydanie na iOS

```bash
npm run ios:init
npm run ios:build
```

Wymagany jest macOS z Xcode oraz konto w programie dla deweloperów Apple. Profil podpisu ustawiasz w projekcie w `src-tauri/gen/apple`.

## Testowanie na urządzeniu w sieci lokalnej

```bash
TAURI_DEV_HOST=192.168.0.10 npm run android:dev
```

Zmienna `TAURI_DEV_HOST` ustawia adres serwera Vite widoczny dla telefonu. Serwer deweloperski nasłuchuje na `0.0.0.0`, więc urządzenie w tej samej sieci połączy się bez dodatkowej konfiguracji.

## Zasady bezpieczeństwa treści

Plik `src-tauri/tauri.conf.json` ustawia nagłówek CSP. Dozwolone są tylko te zasoby, których używa aplikacja:

| Dyrektywa     | Dozwolone źródła                                    |
| ------------- | --------------------------------------------------- |
| `script-src`  | własne pliki, `cdn.jsdelivr.net`, `esm.sh`          |
| `connect-src` | kanał IPC, `emkc.org`, `cdn.jsdelivr.net`, `esm.sh` |
| `frame-src`   | własne pliki, `blob:`, `data:`                      |

Uprawnienia Tauri opisuje `src-tauri/capabilities/default.json`. Aplikacja prosi tylko o odczyt informacji o systemie i zapis tekstu do schowka.
