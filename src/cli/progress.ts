import ora, { Ora } from 'ora';
import chalk from 'chalk';

export class ProgressIndicator {
  private spinner: Ora | null = null;

  monthStarted(year: number, month: number): void {
    const monthStr = month.toString().padStart(2, '0');
    const message = `Processing ${year}-${monthStr}...`;

    if (this.spinner) {
      this.spinner.text = message;
    } else {
      this.spinner = ora(message).start();
    }
  }

  dayStarted(date: string): void {
    if (this.spinner) {
      this.spinner.text = `Fetching archive for ${date}...`;
    }
  }

  archivePageLoaded(count: number): void {
    if (this.spinner) {
      this.spinner.text = `Found ${count} article${count !== 1 ? 's' : ''} to fetch...`;
    }
  }

  articleFetching(current: number, total: number, url?: string): void {
    if (this.spinner) {
      const percentage = Math.round((current / total) * 100);
      this.spinner.text = `Fetching articles... ${current}/${total} (${percentage}%)`;
    }
  }

  articleFetched(title: string, filtered: boolean): void {
    // Optionally log individual article fetches
    // For now, we'll rely on the articleFetching progress
    if (filtered && this.spinner) {
      // Could log filtered articles if needed
      // this.spinner.text += ` (filtered: ${title})`;
    }
  }

  articleFailed(url: string): void {
    // Errors are logged to file, we don't need to spam the console
    // Just continue showing progress
  }

  success(message: string): void {
    if (this.spinner) {
      this.spinner.succeed(chalk.green(message));
      this.spinner = null;
    } else {
      console.log(chalk.green(`✓ ${message}`));
    }
  }

  error(message: string): void {
    if (this.spinner) {
      this.spinner.fail(chalk.red(message));
      this.spinner = null;
    } else {
      console.log(chalk.red(`✗ ${message}`));
    }
  }

  info(message: string): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
    console.log(chalk.blue(`ℹ ${message}`));
  }

  stop(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = null;
    }
  }
}
