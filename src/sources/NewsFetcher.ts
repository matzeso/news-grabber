import { Article } from '../types/Article';

export abstract class NewsFetcher {
  abstract fetchArticles(year: number, month: number): Promise<Article[]>;
}
