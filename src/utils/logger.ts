import fs from 'fs';
import path from 'path';

export class Logger {
  private logFilePath: string;

  constructor(outputDir: string = 'output') {
    this.logFilePath = path.join(outputDir, 'errors.log');
    this.ensureLogFileExists();
  }

  private ensureLogFileExists(): void {
    const dir = path.dirname(this.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public logError(message: string, context?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    const logEntry = `[${timestamp}] ERROR: ${message}${contextStr}\n`;

    fs.appendFileSync(this.logFilePath, logEntry);
  }
}
