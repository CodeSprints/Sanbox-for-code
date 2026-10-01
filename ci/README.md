# Konfiguracja CI / CI configuration

Plik `github-actions-ci.yml` zawiera gotowy przepływ pracy GitHub Actions. Skopiuj go do katalogu `.github/workflows/`, aby go włączyć:

The `github-actions-ci.yml` file contains a ready GitHub Actions workflow. Copy it into `.github/workflows/` to enable it:

```bash
mkdir -p .github/workflows
cp ci/github-actions-ci.yml .github/workflows/ci.yml
```

## Zadania / Jobs

| Zadanie / Job | Opis / Description                                                                               |
| ------------- | ------------------------------------------------------------------------------------------------ |
| `quality`     | lint, sprawdzenie typów, testy z pokryciem, budowa wersji WWW / lint, types, coverage, web build |
| `desktop`     | budowa Tauri na Ubuntu, Windowsie i macOS / Tauri build on Ubuntu, Windows and macOS             |
