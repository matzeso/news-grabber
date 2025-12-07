import { FetchEvent } from '../types/FetchEvent';

export abstract class NewsFetcher {
  abstract fetchArticles(year: number, month: number): AsyncGenerator<FetchEvent>;
}
