import ora, { Ora } from 'ora';
import chalk from 'chalk';

export class ProgressIndicator {
  private spinner: Ora | null = null;

  startFetching(year: number, month: number, current: number, total: number): void {
    const monthStr = month.toString().padStart(2, '0');
    const message = `Fetching ${year}-${monthStr}... (${current}/${total} months)`;

    if (this.spinner) {
      this.spinner.text = message;
    } else {
      this.spinner = ora(message).start();
    }
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
