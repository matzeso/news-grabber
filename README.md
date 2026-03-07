# News Grabber

A CLI tool for downloading and filtering news articles from Tagesschau. Export articles as JSON or plain text, with support for keyword filtering and wildcards.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)

## Installation

```bash
git clone https://github.com/matzeso/news-grabber.git
cd news-grabber
npm install
```

## Usage

### Interactive mode

Run without arguments to be guided through the options:

```bash
npm run start
```

### Command-line mode

```bash
npm run start -- -s Tagesschau -t <time> -f <format> [--filters <keywords>] [--filter-text]
```

**Options:**

| Flag | Description |
|------|-------------|
| `-s, --source <source>` | News source (currently: `Tagesschau`) |
| `-t, --time <time>` | Time period — a year (`2024`) or a specific month (`2024-12`) |
| `-f, --format <format>` | Output format: `json` or `txt` |
| `--filters <keywords>` | Comma-separated keywords with optional wildcards |
| `--filter-text` | Also search in article text, not just the title |

### Examples

```bash
# Download all articles from December 2024 as JSON
npm run start -- -s Tagesschau -t 2024-12 -f json

# Download all 2025 articles mentioning "Trump" as text files
npm run start -- -s Tagesschau -t 2025 -f txt --filters "Trump*"

# Download articles about climate, searching in title and text
npm run start -- -s Tagesschau -t 2024-06 -f json --filters "*climate*,*Klima*" --filter-text

# Download migration-related articles
npm run start -- -s Tagesschau -t 2024-11 -f txt --filters "migra*,asyl*,flücht*"
```

### Filter syntax

- `Trump` — exact match in title
- `Trump*` — prefix match ("Trump", "Trumps", ...)
- `*climate*` — contains match
- `climate,economy` — matches any of the listed keywords

## Output

Articles are saved to `output/YYYY/MM/`:

```
output/2024/12/20241225-example-article-title.json
output/2024/12/20241225-example-article-title.txt
```

**JSON** contains title, publish date, full article text, and metadata (images, authors, keywords, etc.).

**TXT** contains the title followed by the article text.

## License

MIT
