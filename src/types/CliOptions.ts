export type OutputFormat = 'json' | 'txt';

export interface CliOptions {
  source: string;
  time: string;
  format: OutputFormat;
  filters?: string;
}
