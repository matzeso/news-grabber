import axios from 'axios';
import * as cheerio from 'cheerio';
import { NewsFetcher } from './NewsFetcher';
import { Article } from '../types/Article';
import { TagesschauArticleSchema } from '../types/TagesschauArticleSchema';
import { retryWithDelay } from '../utils/retry';
import { generateDaysForMonth, formatDateForUrl } from '../utils/dateUtils';
import { Logger } from '../utils/logger';

export class TagesschauNewsFetcher extends NewsFetcher {
  private logger: Logger;

  constructor() {
    super();
    this.logger = new Logger();
  }

  async fetchArticles(year: number, month: number): Promise<Article[]> {
    const is2024OrEarlier = year <= 2024;

    if (is2024OrEarlier) {
      return this.fetchMonthlyArticles(year, month);
    } else {
      return this.fetchDailyArticles(year, month);
    }
  }

  private async fetchMonthlyArticles(year: number, month: number): Promise<Article[]> {
    const monthStr = month.toString().padStart(2, '0');
    const url = `https://www.tagesschau.de/archiv?datum=${year}-${monthStr}-01`;

    try {
      const articles = await retryWithDelay(() => this.fetchArticlesFromArchivePage(url));
      return articles;
    } catch (error) {
      this.logger.logError(`Failed to fetch articles for ${year}-${monthStr}`, {
        url,
        error: error instanceof Error ? error.message : String(error)
      });
      return [];
    }
  }

  private async fetchDailyArticles(year: number, month: number): Promise<Article[]> {
    const days = generateDaysForMonth(year, month);
    const allArticles: Article[] = [];

    for (const day of days) {
      const dateStr = formatDateForUrl(day);
      const url = `https://www.tagesschau.de/archiv?datum=${dateStr}`;

      try {
        const articles = await retryWithDelay(() => this.fetchArticlesFromArchivePage(url));
        allArticles.push(...articles);
      } catch (error) {
        this.logger.logError(`Failed to fetch articles for ${dateStr}`, {
          url,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return allArticles;
  }

  private async fetchArticlesFromArchivePage(archiveUrl: string): Promise<Article[]> {
    const response = await axios.get(archiveUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const elements = $('div.copytext-element-wrapper__vertical-only').toArray();
    const articles: Article[] = [];

    for (const element of elements) {
      const firstLink = $(element).find('a').first();
      const href = firstLink.attr('href');

      if (href) {
        try {
          const article = await retryWithDelay(() => this.fetchArticleDetails(`https://tagesschau.de${href}`));
          if (article) {
            articles.push(article);
          }
        } catch (error) {
          this.logger.logError(`Failed to fetch article details`, {
            href,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }

    return articles;
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
