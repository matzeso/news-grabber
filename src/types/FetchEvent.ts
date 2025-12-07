import { Article } from './Article';

export type FetchEvent =
  | { type: 'month_started'; year: number; month: number }
  | { type: 'day_started'; date: string }
  | { type: 'archive_page_loaded'; articleCount: number }
  | { type: 'article_fetching'; current: number; total: number; url: string }
  | { type: 'article_fetched'; article: Article }
  | { type: 'article_failed'; url: string; error: string };
