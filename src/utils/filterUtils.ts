import { Article } from '../types/Article';

export function parseFilterString(input: string): string[] {
  if (!input || input.trim() === '') {
    return [];
  }

  return input
    .split(',')
    .map(filter => filter.trim())
    .filter(filter => filter.length > 0);
}

export function matchesFilter(article: Article, filters: string[]): boolean {
  // If no filters, include all articles
  if (filters.length === 0) {
    return true;
  }

  const searchText = `${article.title} ${article.articleText}`.toLowerCase();

  // Check if any filter matches
  for (const filter of filters) {
    const pattern = wildcardToRegex(filter.toLowerCase());
    if (pattern.test(searchText)) {
      return true;
    }
  }

  return false;
}

function wildcardToRegex(pattern: string): RegExp {
  // Escape special regex characters except *
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

  // Convert * to .*
  const regexPattern = escaped.replace(/\*/g, '.*');

  return new RegExp(regexPattern);
}
