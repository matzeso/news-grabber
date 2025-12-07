export interface Article {
  publishDate: Date;
  title: string;
  articleText: string;
  meta: Record<string, unknown>;
}
