import fs from 'fs';
import { OutputFormatter } from './OutputFormatter';
import { Article } from '../types/Article';
import { getOutputPath, slugify } from '../utils/fileSystem';
import { formatDateForFilename } from '../utils/dateUtils';

export class JsonFormatter implements OutputFormatter {
  async writeArticle(article: Article): Promise<void> {
    const date = article.publishDate;
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const dateStr = formatDateForFilename(date);
    const slug = slugify(article.title);
    const filename = `${dateStr}-${slug}.json`;

    const filePath = getOutputPath(year, month, filename);

    fs.writeFileSync(filePath, JSON.stringify(article, null, 2));
  }
}
