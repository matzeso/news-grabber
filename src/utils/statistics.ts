import chalk from 'chalk';

export class Statistics {
  totalFound: number = 0;
  totalFetched: number = 0;
  totalFiltered: number = 0;
  totalFailed: number = 0;
  totalSkipped: number = 0;

  incrementFound(count: number): void {
    this.totalFound += count;
  }

  incrementFetched(): void {
    this.totalFetched++;
  }

  incrementFiltered(): void {
    this.totalFiltered++;
  }

  incrementFailed(): void {
    this.totalFailed++;
  }

  incrementSkipped(): void {
    this.totalSkipped++;
  }

  getSummary(hasFilters: boolean): string {
    const lines = [
      '',
      chalk.bold('Statistics:'),
      `  Articles found: ${this.totalFound}`,
      `  Successfully fetched: ${this.totalFetched}`,
      `  Skipped (not NewsArticle): ${this.totalSkipped}`,
    ];

    if (hasFilters) {
      lines.push(`  Passed filters: ${this.totalFiltered}`);
    }

    lines.push(`  Failed to fetch: ${this.totalFailed}`);
    lines.push(`  Saved to disk: ${this.totalFiltered}`);

    return lines.join('\n');
  }
}
