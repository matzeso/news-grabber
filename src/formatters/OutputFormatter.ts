import { Article } from '../types/Article';

export interface OutputFormatter {
  write(articles: Article[]): Promise<void>;
}
