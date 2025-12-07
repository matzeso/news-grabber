import { CliOptions } from './types/CliOptions';
import { parseTimeInput } from './utils/dateUtils';
import { TagesschauNewsFetcher } from './sources/TagesschauNewsFetcher';
import { JsonFormatter } from './formatters/JsonFormatter';
import { TxtFormatter } from './formatters/TxtFormatter';
import { OutputFormatter } from './formatters/OutputFormatter';
import { ProgressIndicator } from './cli/progress';
import chalk from 'chalk';

export async function run(options: CliOptions): Promise<void> {
  const progress = new ProgressIndicator();

  try {
    // Parse time input
    const yearMonths = parseTimeInput(options.time);

    // Initialize fetcher based on source
    const fetcher = getFetcher(options.source);

    // Initialize formatter based on format
    const formatter = getFormatter(options.format);

    progress.info(`Starting to fetch ${yearMonths.length} month(s) from ${options.source}`);
    progress.info(`Output format: ${options.format}`);

    let totalArticles = 0;

    // Process each month
    for (let i = 0; i < yearMonths.length; i++) {
      const { year, month } = yearMonths[i];

      progress.startFetching(year, month, i + 1, yearMonths.length);

      try {
        const articles = await fetcher.fetchArticles(year, month);

        if (articles.length > 0) {
          await formatter.write(articles);
          totalArticles += articles.length;
          progress.success(`Fetched ${articles.length} articles for ${year}-${month.toString().padStart(2, '0')}`);
        } else {
          progress.info(`No articles found for ${year}-${month.toString().padStart(2, '0')}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        progress.error(`Failed to process ${year}-${month.toString().padStart(2, '0')}: ${errorMsg}`);
      }
    }

    progress.stop();
    console.log(chalk.green.bold(`\n✓ Complete! Fetched ${totalArticles} articles in total.`));
    console.log(chalk.gray(`Output saved to: output/`));

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
