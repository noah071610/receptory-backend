import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CachedService } from 'src/cache/cached.service';
import { cacheKeys } from 'src/cache/keys';
import { DatabaseService } from 'src/database/database.service';
import { Langs, SaveType } from 'src/types';

@Injectable()
export class PageService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cachedService: CachedService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findOnePage(pageId: string) {
    const page = await this.cachedService.getCachedPage(pageId);

    return page;
  }

  async deploy(pageDto: SaveType, userId: string) {
    const { content, pageId } = pageDto;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { currentUsedColors, currentUsedImages, stage, ...pageContent } =
      content;

    const data = {
      ...pageDto,
      userId,
      content: JSON.stringify(pageContent),
    };

    const savePage = await this.databaseService.page.upsert({
      where: { userId, pageId }, // 업데이트 또는 생성할 사용자의 고유 식별자
      create: data,
      update: data,
    });

    await this.cacheManager.set(
      cacheKeys.page(pageId),
      JSON.stringify(savePage),
    );

    data.content = JSON.stringify(content);

    await this.databaseService.save.update({
      where: { userId, pageId }, // 업데이트 또는 생성할 사용자의 고유 식별자
      data,
    });

    return 'ok';
  }

  async inactivePage(pageId: string, userId: string) {
    await this.databaseService.page.update({
      where: {
        pageId,
        userId,
      },
      data: {
        format: 'inactive',
      },
    });

    await this.databaseService.save.update({
      where: {
        pageId,
        userId,
      },
      data: {
        format: 'inactive',
      },
    });

    await this.cacheManager.del(cacheKeys.page(pageId));

    return 'ok';
  }

  async changeLang(pageId: string, userId: string, lang: Langs) {
    const page = await this.databaseService.page.findUnique({
      where: {
        pageId,
        userId,
      },
    });
    if (page) {
      await this.databaseService.page.update({
        where: {
          pageId,
          userId,
        },
        data: {
          lang,
        },
      });
    }

    await this.databaseService.save.update({
      where: {
        pageId,
        userId,
      },
      data: {
        lang,
      },
    });

    await this.cacheManager.del(cacheKeys.page(pageId));

    return 'ok';
  }
}
