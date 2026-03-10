import fs from 'fs';
import { OutputFormatter } from './OutputFormatter';
import { Article } from '../types/Article';
import { getOutputPath, slugify } from '../utils/fileSystem';
import { formatDateForFilename } from '../utils/dateUtils';

function formatDateGerman(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const millis = date.getMilliseconds().toString().padStart(3, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}.${millis}`;
}

export class TxtFormatter implements OutputFormatter {
  async writeArticle(article: Article): Promise<void> {
    const date = article.publishDate;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dateStr = formatDateForFilename(date);
    const slug = slugify(article.title);
    const filename = `${dateStr}-${slug}.txt`;

    const filePath = getOutputPath(year, month, filename);

    const url = (article.meta.mainEntityOfPage as string) ?? '';
    const pubDate = formatDateGerman(date);

    const content = `Veröffentlichungsdatum:\n${pubDate}\n\nURL:\n${url}\n\nTitel:\n${article.title}\n\n${article.articleText}`;
    fs.writeFileSync(filePath, content);
  }
}
