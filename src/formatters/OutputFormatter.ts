import { Article } from '../types/Article';

export interface OutputFormatter {
  writeArticle(article: Article): Promise<void>;
}
