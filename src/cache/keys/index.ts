export const cacheKeys = {
  page: (pageId: string) => `page$${pageId}`,
} as const;
