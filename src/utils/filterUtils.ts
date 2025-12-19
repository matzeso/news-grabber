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

export function matchesFilter(article: Article, filters: string[], includeText = false): boolean {
  // If no filters, include all articles
  if (filters.length === 0) {
    return true;
  }

  const searchText = `${article.title} ${includeText ? article.articleText :''}`.trim().toLowerCase();

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
  // 1. Escape special regex characters (like +, ?, ^, $) to treat them as text
  // We exclude * from this list because we want to handle it manually later
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

  // 2. Convert wildcard * to Regex .*
  const regexBody = escaped.replace(/\*/g, '.*');

  // 3. Determine if we need word boundaries (\b)
  // If pattern starts with *, we match part of a word -> No starting boundary
  // If pattern does NOT start with *, we match start of a word -> Add \b
  const startBoundary = pattern.startsWith('*') ? '' : '\\b';

  // Same logic for the end
  const endBoundary = pattern.endsWith('*') ? '' : '\\b';

  // Construct the final RegExp
  return new RegExp(`${startBoundary}${regexBody}${endBoundary}`);
}
