export interface ImageObject {
  '@type': 'ImageObject';
  url: string;
  author: string;
  width: number;
  height: number;
  datePublished: string;
  description: string;
}

export interface Publisher {
  '@type': 'newsMediaOrganization';
  name: string;
  url: string;
  logo: {
    '@type': 'ImageObject';
    url: string;
  };
}

export interface TagesschauArticleSchema {
  '@context': string;
  '@type': 'NewsArticle';
  dateModified: string;
  datePublished: string;
  isAccessibleForFree: string;
  headline: string;
  description: string;
  keywords: string[];
  articleBody: string;
  mainEntityOfPage: string;
  author: unknown[];
  publisher: Publisher;
  image: ImageObject[];
}
