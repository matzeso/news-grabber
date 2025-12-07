import fs from 'fs';
import { OutputFormatter } from './OutputFormatter';
import { Article } from '../types/Article';
import { getOutputPath, slugify } from '../utils/fileSystem';
import { formatDateForFilename } from '../utils/dateUtils';

export class TxtFormatter implements OutputFormatter {
  async write(articles: Article[]): Promise<void> {
    for (const article of articles) {
      const date = article.publishDate;
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const dateStr = formatDateForFilename(date);
      const slug = slugify(article.title);
      const filename = `${dateStr}-${slug}.txt`;

      const filePath = getOutputPath(year, month, filename);

      const content = `${article.title}\n\n${article.articleText}`;
      fs.writeFileSync(filePath, content);
    }
  }
}
