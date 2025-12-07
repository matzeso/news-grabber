import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

function formatDateForFilename(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().replace(/[:.]/g, '-');
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchAndParse() {
  try {
    const url = 'https://www.tagesschau.de/archiv?datum=2025-11-01';
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);

    const elements = $('div.copytext-element-wrapper__vertical-only').toArray();

    for (const element of elements) {
      const firstLink = $(element).find('a').first();
      const href = firstLink.attr('href');

      if (href) {
        try {
          const linkResponse = await axios.get(href.startsWith('http') ? href : `https://tagesschau.de${href}`);
          const linkHtml = linkResponse.data;
          const link$ = cheerio.load(linkHtml);

          const scripts = link$('script[type="application/ld+json"]');
          scripts.each((_, scriptElement) => {
            try {
              const jsonContent = JSON.parse(link$(scriptElement).html() || '');

              if (jsonContent['@type'] === 'NewsArticle') {
                const datePublished = jsonContent.datePublished;
                const headline = jsonContent.headline;

                if (datePublished && headline) {
                  const formattedDate = formatDateForFilename(datePublished);
                  const slug = slugify(headline);
                  const filename = `${formattedDate}_${slug}.json`;
                  const filePath = path.join(__dirname, '..', 'output', filename);

                  fs.writeFileSync(filePath, JSON.stringify(jsonContent, null, 2));
                  console.log(`Saved JSON to ${filePath}`);


                }
              }
            } catch (jsonError) {
              console.error('Error parsing JSON:', jsonError);
            }
          });
        } catch (linkError) {
          console.error(`Error fetching link ${href}:`, linkError);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching or parsing the HTML:', error);
  }
}

fetchAndParse();
