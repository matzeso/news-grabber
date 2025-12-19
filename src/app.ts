import { CliOptions } from './types/CliOptions';
import { parseTimeInput } from './utils/dateUtils';
import { TagesschauNewsFetcher } from './sources/TagesschauNewsFetcher';
import { JsonFormatter } from './formatters/JsonFormatter';
import { TxtFormatter } from './formatters/TxtFormatter';
import { OutputFormatter } from './formatters/OutputFormatter';
import { ProgressIndicator } from './cli/progress';
import { Statistics } from './utils/statistics';
import { parseFilterString, matchesFilter } from './utils/filterUtils';
import chalk from 'chalk';

export async function run(options: CliOptions): Promise<void> {
  const progress = new ProgressIndicator();
  const stats = new Statistics();

  try {
    // Parse time input and filters
    const yearMonths = parseTimeInput(options.time);
    const filters = parseFilterString(options.filters || '');
    const hasFilters = filters.length > 0;

    // Initialize fetcher based on source
    const fetcher = getFetcher(options.source);

    // Initialize formatter based on format
    const formatter = getFormatter(options.format);

    // Display startup info
    progress.info(`Starting to fetch ${yearMonths.length} month(s) from ${options.source}`);
    progress.info(`Output format: ${options.format}`);
    if (hasFilters) {
      const filterScope = options.filterIncludeText ? 'title + text' : 'title only';
      progress.info(`Filters: ${filters.join(', ')} (${filterScope})`);
    }

    // Process each month
    for (const { year, month } of yearMonths) {
      try {
        // Consume the generator and process events
        for await (const event of fetcher.fetchArticles(year, month)) {
          switch (event.type) {
            case 'month_started':
              progress.monthStarted(event.year, event.month);
              break;

            case 'day_started':
              progress.dayStarted(event.date);
              break;

            case 'archive_page_loaded':
              stats.incrementFound(event.articleCount);
              progress.archivePageLoaded(event.articleCount);
              break;

            case 'article_fetching':
              progress.articleFetching(event.current, event.total, event.url);
              break;

            case 'article_fetched':
              stats.incrementFetched();

              // Apply filters
              if (matchesFilter(event.article, filters, options.filterIncludeText)) {
                stats.incrementFiltered();
                await formatter.writeArticle(event.article);
                progress.articleFetched(event.article.title, false);
              } else {
                progress.articleFetched(event.article.title, true);
              }
              break;

            case 'article_failed':
              stats.incrementFailed();
              progress.articleFailed(event.url);
              break;

            case 'article_skipped':
              stats.incrementSkipped();
              break;
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        progress.error(`Failed to process ${year}-${month.toString().padStart(2, '0')}: ${errorMsg}`);
      }
    }

    // Stop spinner and show summary
    progress.stop();
    console.log(chalk.green.bold('\n✓ Complete!'));
    console.log(stats.getSummary(hasFilters));
    console.log(chalk.gray('\nOutput saved to: output/'));

    if (stats.totalFailed > 0) {
      console.log(chalk.yellow(`\nSome articles failed to fetch. Check output/errors.log for details.`));
    }

  } catch (error) {
    progress.stop();
    const errorMsg = error instanceof Error ? error.message : String(error);
    progress.error(`Application error: ${errorMsg}`);
    throw error;
  }
}

function getFetcher(source: string) {
  switch (source.toLowerCase()) {
    case 'tagesschau':
      return new TagesschauNewsFetcher();
    default:
      throw new Error(`Unknown source: ${source}`);
  }
}

function getFormatter(format: string): OutputFormatter {
  switch (format.toLowerCase()) {
    case 'json':
      return new JsonFormatter();
    case 'txt':
      return new TxtFormatter();
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}
