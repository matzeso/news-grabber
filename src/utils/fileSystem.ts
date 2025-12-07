import fs from 'fs';
import path from 'path';

export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function getOutputPath(year: number, month: number, filename: string): string {
  const monthStr = month.toString().padStart(2, '0');
  const yearStr = year.toString();

  const dirPath = path.join('output', yearStr, monthStr);
  ensureDirectoryExists(dirPath);

  return path.join(dirPath, filename);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
