# News Grabber

A powerful CLI tool for downloading and filtering news articles from Tagesschau. Export articles as JSON or plain text, with support for keyword filtering and wildcards.

## Features

- 📰 **Download news articles** from Tagesschau archive
- 🔍 **Filter by keywords** with wildcard support (e.g., `Trump*`, `*climate*`)
- 📅 **Flexible time selection** - download by year (2024) or month (2024-12)
- 💾 **Multiple export formats** - JSON (complete metadata) or TXT (title + text)
- ⚡ **Fast parallel fetching** - downloads 10 articles simultaneously
- 🎯 **Smart filtering** - excludes FAQs, interviews, and non-article content
- 📊 **Detailed statistics** - see exactly what was downloaded, filtered, and skipped
- 🌐 **Cross-platform** - works on macOS, Windows, and Linux

## Quick Start

### For End Users (No coding required!)

1. **Download** the latest executable for your system:
   - [macOS (Intel)](https://github.com/matzeso/news-grabber/releases) - `news-grabber-macos-x64`
   - [macOS (Apple Silicon)](https://github.com/matzeso/news-grabber/releases) - `news-grabber-macos-arm64`
   - [Windows](https://github.com/matzeso/news-grabber/releases) - `news-grabber-win-x64.exe`
   - [Linux](https://github.com/matzeso/news-grabber/releases) - `news-grabber-linux-x64`

2. **Make it executable** (macOS/Linux only):
   ```bash
   chmod +x news-grabber-*
   ```

3. **Run it**:
   ```bash
   # macOS/Linux
   ./news-grabber-macos-arm64

   # Windows
   news-grabber-win-x64.exe
   ```

4. **Follow the prompts**:
   - Select news source (Tagesschau)
   - Enter time period (e.g., `2024` or `2024-12`)
   - Choose format (JSON or TXT)
   - Add keyword filters (optional, comma-separated)

5. **Find your articles** in the `output/` folder!

### Usage Examples

**Interactive mode** (recommended for beginners):
```bash
./news-grabber-macos-arm64
```

**Direct command** (for advanced users):
```bash
# Download all December 2024 articles about climate
./news-grabber-macos-arm64 -s Tagesschau -t 2024-12 -f txt --filters "climate,*warming*"

# Download all 2024 articles about Trump in JSON format
./news-grabber-macos-arm64 -s Tagesschau -t 2024 -f json --filters "Trump*"

# Download November 2024 migration-related articles
./news-grabber-macos-arm64 -s Tagesschau -t 2024-11 -f txt --filters "migra*,asyl*,flücht*"
```

**Filter Examples**:
- `Trump` - exact match for "Trump"
- `Trump*` - matches "Trump", "Trumps", "Trump's", etc.
- `*climate*` - matches anything containing "climate"
- `climate,economy,Ukraine` - matches any of these words

## Output Structure

Articles are saved to `output/YYYY/MM/` with filenames like:
```
output/2024/12/20241225-example-article-title.json
output/2024/12/20241225-example-article-title.txt
```

**JSON format** includes:
- Title, publish date, article text
- Full metadata (images, authors, keywords, etc.)

**TXT format** includes:
- First line: Article title
- Empty line
- Full article text

## Statistics Explained

After each run, you'll see statistics like:
```
Statistics:
  Articles found: 249           ← URLs found on archive pages
  Successfully fetched: 230     ← Articles downloaded
  Skipped (not NewsArticle): 19 ← Videos, podcasts, external links (excluded)
  Passed filters: 16            ← Articles matching your filters
  Failed to fetch: 0            ← Network errors
  Saved to disk: 16             ← Files created
```

---

## For Developers

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/news-grabber.git
   cd news-grabber
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run in development**:
   ```bash
   npm start
   ```

### Development Commands

```bash
npm start              # Run with tsx (TypeScript directly)
npm run build          # Compile TypeScript to dist/
npm run build:exe      # Build standalone executables for all platforms
npm run clean          # Remove dist/ and build/ directories
```

### Architecture Overview

**Event-Driven Generator Pattern:**
- `NewsFetcher` (abstract) → Yields events as articles are discovered
- `TagesschauNewsFetcher` → Implements parallel fetching with worker pool (10 concurrent)

**Key Components:**
- **CLI** (`src/cli/`) - Interactive prompts (inquirer) & argument parsing (commander)
- **Fetchers** (`src/sources/`) - Scrape & fetch articles (axios + cheerio)
  - Worker pool pattern for parallel fetching
  - Retry logic with 2s delay
  - Label filtering (excludes FAQ, interview)
- **Formatters** (`src/formatters/`) - Write JSON or TXT output
- **Filters** (`src/utils/filterUtils.ts`) - Keyword matching with wildcard support
- **Progress** (`src/cli/progress.ts`) - Spinners (ora) & colored output (chalk)

**Flow:**
```
User Input → CLI → NewsFetcher (yields events) → Filter → Formatter → Disk
                        ↓
                   10 Workers (parallel)
                        ↓
                  Archive → Articles
```

**Event Types:**
- `month_started`, `day_started` - Progress milestones
- `archive_page_loaded` - Found X article links
- `article_fetching` - Downloading article X/Y
- `article_fetched` - Article successfully retrieved
- `article_skipped` - Not a NewsArticle (video, podcast, etc.)
- `article_failed` - HTTP error after retry

### Tech Stack

- **Language**: TypeScript
- **HTTP**: axios
- **HTML Parsing**: cheerio
- **CLI**: commander, inquirer
- **UI**: chalk (colors), ora (spinners)
- **Build**: pkg (standalone executables)

### Contributing

Pull requests welcome! Please ensure:
- TypeScript compiles without errors
- Code follows existing patterns
- Features are documented

### License

MIT License - feel free to use and modify!

---

## Troubleshooting

**"Permission denied" on macOS/Linux**:
```bash
chmod +x news-grabber-*
```

**Executables are large (~50MB)**:
- This is normal - they include Node.js runtime for standalone execution
- No separate Node.js installation needed!

**No articles found**:
- Check the date format (YYYY or YYYY-MM)
- Verify filters aren't too restrictive
- Some dates may have no articles

**Some articles skipped**:
- Expected! Tagesschau archive includes videos, podcasts, and external links
- Only NewsArticle type content is downloaded

## Links

- [GitHub Repository](https://github.com/YOUR_USERNAME/news-grabber)
- [Report Issues](https://github.com/YOUR_USERNAME/news-grabber/issues)
- [Releases](https://github.com/YOUR_USERNAME/news-grabber/releases)
