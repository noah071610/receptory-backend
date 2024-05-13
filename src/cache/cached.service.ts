import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Page } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { PageType } from 'src/types';
import { cacheKeys } from './keys';

@Injectable()
export class CachedService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly databaseService: DatabaseService,
  ) {}

  async getCachedPage(pageId: string): Promise<null | PageType> {
    const pageJson: string | null = await this.cacheManager.get(
      cacheKeys.page(pageId),
    );

    let data;
    if (!pageJson) {
      const page = await this.databaseService.page.findUnique({
        where: {
          pageId,
        },
      });
      if (!page) {
        return null;
      }
      await this.cacheManager.set(pageId, page);
      data = page;
    } else {
      const parsePage: Page = JSON.parse(pageJson);
      data = parsePage;
      return {
        ...data,
        content: JSON.parse(data.content as string),
      } as PageType;
    }
  }
}
