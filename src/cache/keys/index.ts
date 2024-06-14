import { Langs } from 'src/types';

export const cacheKeys = {
  page: (pageId: string) => `page$${pageId}`,
  template: (pageId: string) => `template$${pageId}`,
  templates: (lang: Langs) => `templates$${lang}`,
} as const;
