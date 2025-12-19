import { Command } from 'commander';
import { promptUserForOptions } from './prompts';
import { CliOptions } from '../types/CliOptions';

export async function getCli(): Promise<CliOptions> {
  const program = new Command();

  program
    .name('news-grabber')
    .description('CLI tool for scraping news articles')
    .version('1.0.0')
    .option('-s, --source <source>', 'news source (e.g., Tagesschau)')
    .option('-t, --time <time>', 'time period (YYYY or YYYY-MM)')
    .option('-f, --format <format>', 'output format (json or txt)')
    .option('--filters <filters>', 'filter keywords (comma-separated, use * for wildcards)')
    .option('--filter-text', 'include article text in filter search (default: title only)');

  program.parse();

  const options = program.opts();

  // If no options provided, use interactive mode
  if (!options.source && !options.time && !options.format) {
    return await promptUserForOptions();
  }

  // Validate required options
  if (!options.source || !options.time || !options.format) {
    throw new Error('Please provide all options: --source, --time, --format');
  }

  return {
    source: options.source,
    time: options.time,
    format: options.format,
    filters: options.filters,
    filterIncludeText: options.filterText
  };
}
