import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Page } from '@prisma/client';
import { prismaExclude } from 'src/config/database/prismaExclude';
import { DatabaseService } from 'src/database/database.service';
import { ErrorMessage } from 'src/error/messages';
import { Langs, PageType, TemplateType } from 'src/types';
import { cacheKeys } from './keys';

const langToId = {
  ko: 1,
  en: 2,
  ja: 3,
  th: 4,
};

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
          customLink: pageId,
        },
        select: {
          ...prismaExclude('Page', ['analyser']),
        },
      });
      if (!page) {
        throw new HttpException(ErrorMessage.noPost, HttpStatus.NOT_FOUND);
      }

      await this.cacheManager.set(cacheKeys.page(pageId), JSON.stringify(page));
      data = page;
    } else {
      const parsePage: Page = JSON.parse(pageJson);
      data = parsePage;
    }

    return {
      ...data,
      content: JSON.parse(data.content as string),
    } as PageType;
  }

  async getTemplates(lang: Langs): Promise<null | TemplateType[]> {
    const dataJson: string | null = await this.cacheManager.get(
      cacheKeys.templates(lang),
    );

    if (!dataJson) {
      const templateData = await this.databaseService.website.findUnique({
        where: {
          lang,
          type: 'template',
          id: langToId[lang],
        },
        select: {
          content: true,
        },
      });

      await this.cacheManager.set(
        cacheKeys.templates(lang),
        JSON.stringify(templateData.content),
      );

      return JSON.parse(templateData.content as string) as TemplateType[];
    }
    return JSON.parse(dataJson) as TemplateType[];
  }

  async getTemplateCache(pageId: string): Promise<null | PageType> {
    const pageJson: string | null = await this.cacheManager.get(
      cacheKeys.template(pageId),
    );

    let data;
    if (!pageJson) {
      const template = await this.databaseService.template.findUnique({
        where: {
          pageId,
        },
      });
      if (!template) {
        throw new HttpException(ErrorMessage.noPost, HttpStatus.NOT_FOUND);
      }

      await this.cacheManager.set(
        cacheKeys.template(pageId),
        JSON.stringify(template),
      );
      data = template;
    } else {
      const parsePage: Page = JSON.parse(pageJson);
      data = parsePage;
    }

    return {
      ...data,
      content: JSON.parse(data.content as string),
    } as PageType;
  }
}
