# News Grabber

Ein CLI-Tool zum Herunterladen und Filtern von Nachrichtenartikeln der Tagesschau. Artikel können als JSON oder Textdatei exportiert werden, mit Unterstützung für Stichwortfilter und Platzhalter (Wildcards).

## Voraussetzungen

- [Node.js](https://nodejs.org/) (v18 oder neuer)

## Installation

```bash
git clone https://github.com/matzeso/news-grabber.git
cd news-grabber
npm install
```

## Nutzung

### Interaktiver Modus

Ohne Argumente starten, um durch die Optionen geführt zu werden:

```bash
npm run start
```

### Kommandozeilenmodus

```bash
npm run start -- -s Tagesschau -t <Zeitraum> -f <Format> [--filters <Stichwörter>] [--filter-text]
```

**Optionen:**

| Flag | Beschreibung |
|------|--------------|
| `-s, --source <Quelle>` | Nachrichtenquelle (derzeit: `Tagesschau`) |
| `-t, --time <Zeitraum>` | Zeitraum — ein Jahr (`2024`) oder ein bestimmter Monat (`2024-12`) |
| `-f, --format <Format>` | Ausgabeformat: `json` oder `txt` |
| `--filters <Stichwörter>` | Kommagetrennte Stichwörter mit optionalen Platzhaltern |
| `--filter-text` | Auch im Artikeltext suchen, nicht nur im Titel |

### Beispiele

```bash
# Alle Artikel vom Dezember 2024 als JSON herunterladen
npm run start -- -s Tagesschau -t 2024-12 -f json

# Alle Artikel aus 2025 mit "Trump" als Textdateien herunterladen
npm run start -- -s Tagesschau -t 2025 -f txt --filters "Trump*"

# Artikel zum Thema Klima herunterladen, Suche in Titel und Text
npm run start -- -s Tagesschau -t 2024-06 -f json --filters "*climate*,*Klima*" --filter-text

# Artikel zum Thema Migration herunterladen
npm run start -- -s Tagesschau -t 2024-11 -f txt --filters "migra*,asyl*,flücht*"
```

### Filtersyntax

- `Trump` — exakte Übereinstimmung im Titel
- `Trump*` — Präfix-Suche ("Trump", "Trumps", ...)
- `*climate*` — Enthält-Suche
- `climate,economy` — trifft auf eines der aufgelisteten Stichwörter zu

## Ausgabe

Artikel werden unter `output/YYYY/MM/` gespeichert:

```
output/2024/12/20241225-example-article-title.json
output/2024/12/20241225-example-article-title.txt
```

**JSON** enthält Titel, Veröffentlichungsdatum, den vollständigen Artikeltext und Metadaten (Bilder, Autoren, Schlagwörter usw.).

**TXT** enthält Veröffentlichungsdatum, URL und Titel gefolgt vom Artikeltext.

## Lizenz

MIT
