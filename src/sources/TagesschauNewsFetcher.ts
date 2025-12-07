import axios from 'axios';
import * as cheerio from 'cheerio';
import { NewsFetcher } from './NewsFetcher';
import { Article } from '../types/Article';
import { FetchEvent } from '../types/FetchEvent';
import { TagesschauArticleSchema } from '../types/TagesschauArticleSchema';
import { retryWithDelay } from '../utils/retry';
import { generateDaysForMonth, formatDateForUrl } from '../utils/dateUtils';
import { Logger } from '../utils/logger';

export class TagesschauNewsFetcher extends NewsFetcher {
  private logger: Logger;
  private concurrency: number;
  private excludedLabels: string[];

  constructor(concurrency: number = 10, excludedLabels: string[] = ['faq', 'interview']) {
    super();
    this.logger = new Logger();
    this.concurrency = concurrency;
    this.excludedLabels = excludedLabels.map(label => label.toLowerCase());
  }

  async *fetchArticles(year: number, month: number): AsyncGenerator<FetchEvent> {
    yield { type: 'month_started', year, month };

    const is2024OrEarlier = year <= 2024;

    if (is2024OrEarlier) {
      yield* this.fetchMonthlyArticles(year, month);
    } else {
      yield* this.fetchDailyArticles(year, month);
    }
  }

  private async *fetchMonthlyArticles(year: number, month: number): AsyncGenerator<FetchEvent> {
    const monthStr = month.toString().padStart(2, '0');
    const url = `https://www.tagesschau.de/archiv?datum=${year}-${monthStr}-01`;

    try {
      yield* this.fetchArticlesFromArchivePage(url);
    } catch (error) {
      this.logger.logError(`Failed to fetch articles for ${year}-${monthStr}`, {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  private async *fetchDailyArticles(year: number, month: number): AsyncGenerator<FetchEvent> {
    const days = generateDaysForMonth(year, month);

    for (const day of days) {
      const dateStr = formatDateForUrl(day);
      const url = `https://www.tagesschau.de/archiv?datum=${dateStr}`;

      yield { type: 'day_started', date: dateStr };

      try {
        yield* this.fetchArticlesFromArchivePage(url);
      } catch (error) {
        this.logger.logError(`Failed to fetch articles for ${dateStr}`, {
          url,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  }

  private async *fetchArticlesFromArchivePage(archiveUrl: string): AsyncGenerator<FetchEvent> {
    const response = await retryWithDelay(() => axios.get(archiveUrl));
    const html = response.data;
    const $ = cheerio.load(html);

    const elements = $('div.copytext-element-wrapper__vertical-only').toArray();
    const articleLinks: string[] = [];

    // Collect all article links, filtering by label
    for (const element of elements) {
      const firstLink = $(element).find('a').first();
      const href = firstLink.attr('href');

      if (href) {
        // Check for excluded labels
        const labelElement = $(firstLink).find('.label strong');
        const label = labelElement.text().toLowerCase().trim();

        // Skip if label is in excluded list
        if (label && this.excludedLabels.includes(label)) {
          continue;
        }

        // Check if href is already a full URL
        const fullUrl = href.startsWith('http') ? href : `https://tagesschau.de${href}`;
        articleLinks.push(fullUrl);
      }
    }

    // Yield archive page loaded event
    yield { type: 'archive_page_loaded', articleCount: articleLinks.length };

    // Fetch articles with concurrency
    yield* this.fetchArticlesWithConcurrency(articleLinks);
  }

  private async *fetchArticlesWithConcurrency(urls: string[]): AsyncGenerator<FetchEvent> {
    if (urls.length === 0) return;

    const total = urls.length;
    let nextIndex = 0;
    let completedCount = 0;
    const events: FetchEvent[] = [];
    let resolveNextEvent: (() => void) | null = null;

    // Helper to enqueue an event
    const enqueueEvent = (event: FetchEvent) => {
      events.push(event);
      if (resolveNextEvent) {
        resolveNextEvent();
        resolveNextEvent = null;
      }
    };

    // Worker function
    const worker = async () => {
      while (true) {
        const index = nextIndex++;
        if (index >= urls.length) break;

        const url = urls[index];
        const current = index + 1;

        // Yield fetching event
        enqueueEvent({ type: 'article_fetching', current, total, url });

        try {
          const article = await retryWithDelay(() => this.fetchArticleDetails(url));
          if (article) {
            enqueueEvent({ type: 'article_fetched', article });
          } else {
            enqueueEvent({ type: 'article_skipped', url, reason: 'Not a NewsArticle or no structured data found' });
          }
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          this.logger.logError(`Failed to fetch article details`, {
            url,
            error: errorMsg
          });
          enqueueEvent({ type: 'article_failed', url, error: errorMsg });
        }

        completedCount++;
      }
    };

    // Start workers
    const workers = Array.from({ length: Math.min(this.concurrency, urls.length) }, () => worker());

    // Yield events as they come in
    while (completedCount < total || events.length > 0) {
      if (events.length > 0) {
        yield events.shift()!;
      } else {
        // Wait for next event
        await new Promise<void>(resolve => {
          resolveNextEvent = resolve;
        });
      }
    }

    // Wait for all workers to complete
    await Promise.all(workers);

    // Yield any remaining events
    while (events.length > 0) {
      yield events.shift()!;
    }
  }

  private async fetchArticleDetails(articleUrl: string): Promise<Article | null> {
    const response = await axios.get(articleUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const scripts = $('script[type="application/ld+json"]');

    for (let i = 0; i < scripts.length; i++) {
      const scriptElement = scripts[i];
      try {
        const jsonContent = JSON.parse($(scriptElement).html() || '');

        // Only process NewsArticle types
        if (jsonContent['@type'] === 'NewsArticle') {
          const schema = jsonContent as TagesschauArticleSchema;

          return {
            publishDate: new Date(schema.datePublished),
            title: schema.headline,
            articleText: schema.articleBody,
            meta: jsonContent
          };
        }
      } catch (error) {
        // Skip invalid JSON
        continue;
      }
    }

    return null;
  }
}
