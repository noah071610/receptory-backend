import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CachedService } from 'src/cache/cached.service';
import { cacheKeys } from 'src/cache/keys';
import { DatabaseService } from 'src/database/database.service';
import { ErrorMessage } from 'src/error/messages';
import { Langs, SaveContentType } from 'src/types';
import getId from 'src/utils/getId';
import { saveSelector } from 'src/utils/selector';

interface DataType {
  category: string;
  cards: {
    pageId: string;
    title: string;
    thumbnail: string;
    description: string;
    lang: string;
    templateLang: Langs;
    isSecret: number;
  }[];
}

const langToId = {
  ko: 1,
  en: 2,
  ja: 3,
  th: 4,
};

// function findStringDuplicates(arr: string[]): string[] {
//   // 각 요소의 빈도를 저장할 맵을 생성
//   const elementCounts: { [key: string]: number } = {};

//   // 배열의 각 요소의 빈도를 계산
//   arr.forEach((str) => {
//     elementCounts[str] = (elementCounts[str] || 0) + 1;
//   });

//   // 빈도가 2 이상인 요소만 포함하는 배열을 생성
//   const duplicates: string[] = [];
//   for (const str in elementCounts) {
//     if (elementCounts[str] > 1) {
//       duplicates.push(str);
//     }
//   }

//   return duplicates;
// }

function parseTextToObjects(text: string): {
  category: string;
  ids: string[];
}[] {
  const lines = text.split('\n');
  const result = [];
  let currentTitle = '';
  let currentIds = [];

  for (const line of lines) {
    if (line.startsWith('### ')) {
      // 새로운 타이틀을 만나면, 이전 타이틀과 ids를 저장
      if (currentTitle) {
        result.push({ category: currentTitle, ids: currentIds });
      }
      // 새로운 타이틀을 설정하고 ids 초기화
      currentTitle = line.slice(4).trim();
      currentIds = [];
    } else if (line.trim()) {
      // 빈 줄이 아닌 경우 id로 간주하고 추가
      currentIds.push(line.trim());
    }
  }

  // 마지막 타이틀과 ids를 저장
  if (currentTitle) {
    result.push({ category: currentTitle, ids: currentIds });
  }

  return result;
}

@Injectable()
export class WebsiteService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cachedService: CachedService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getTemplate(pageId: string) {
    const template = await this.cachedService.getTemplateCache(pageId);

    return template;
  }

  async getTemplates(lang: Langs) {
    const allTemplates = await this.cachedService.getTemplates(lang);
    return allTemplates;
  }

  async getTemplateText({ lang, type }: { lang: Langs; type: 'template' }) {
    const target = await this.databaseService.website.findUnique({
      where: {
        id: langToId[lang] ?? 1,
        type,
      },
      select: {
        text: true,
      },
    });
    return {
      text: target.text,
      lang,
    };
  }

  async useTemplate(templateId: string, userId: string) {
    const template = await this.databaseService.template.findUnique({
      where: {
        pageId: templateId,
      },
    });

    if (!template) {
      throw new HttpException(ErrorMessage.noPost, HttpStatus.NOT_FOUND);
    }

    const newId = getId();
    const templateContent: SaveContentType =
      JSON.parse(template.content as string) ?? {};
    const newSave = await this.databaseService.save.create({
      data: {
        pageId: newId,
        customLink: newId,
        thumbnail: template.thumbnail,
        title: template.title,
        description: template.description,
        format: 'inactive',
        lang: template.templateLang,

        user: {
          connect: {
            userId,
          },
        },

        content: JSON.stringify({
          ...templateContent,
          stage: 'home',
          currentUsedImages: [],
          currentUsedColors: [],
          pageOptions: {
            ...templateContent.pageOptions,
            format: 'inactive',
            customLink: '',
            isNotUseCustomLink: true,
          },
        }),
      },
      select: saveSelector,
    });

    return newSave;
  }

  async setTemplates({ text, lang }: { text: string; lang: Langs }) {
    const afterObj = parseTextToObjects(text);
    const before = await this.databaseService.website.findUnique({
      where: {
        id: langToId[lang] ?? 1,
        type: 'template',
        lang,
      },
      select: {
        content: true,
      },
    });
    if (before) {
      // 기존에 있던 템플릿 전부 삭제
      const beforeContent: DataType[] = JSON.parse(before.content as string);
      beforeContent.map(async ({ cards }) => {
        await Promise.allSettled(
          cards.map(async ({ pageId }) => {
            await this.databaseService.template.delete({
              where: { pageId },
            });

            await this.cacheManager.del(cacheKeys.template(pageId));
          }),
        );
      });
    }

    const createContent: DataType[] = [];
    for (let i = 0; i < afterObj.length; i++) {
      const { category, ids } = afterObj[i];
      const cards = [];
      for (let j = 0; j < ids.length; j++) {
        const newPageId = ids[j];
        const target = await this.databaseService.save.findUnique({
          where: {
            pageId: newPageId,
          },
        });
        if (!target) {
          throw new HttpException(
            { msg: ErrorMessage.noPost, data: newPageId },
            HttpStatus.NOT_FOUND,
          );
        }

        const obj = {
          pageId: newPageId,
          title: target.title,
          thumbnail: target.thumbnail,
          description: target.description,
          lang: target.lang,

          templateLang: lang,
          isSecret: category === 'secret' ? 1 : 0,
        };

        const templateCreateInput = { ...obj, content: target.content };

        const targetTemplate = await this.databaseService.template.findUnique({
          where: { pageId: newPageId },
        });
        if (!targetTemplate) {
          await this.databaseService.template.create({
            data: templateCreateInput,
          });
        }

        cards.push(obj);
      }

      createContent.push({ category, cards });
    }

    await this.cacheManager.del(cacheKeys.templates(lang));

    const contentWithoutSecret = createContent.filter(
      ({ category }) => category !== 'secret',
    );

    const createTemplateInput = {
      lang,
      type: 'template',
      text,
      content: JSON.stringify(contentWithoutSecret),
    };
    await this.databaseService.website.upsert({
      where: {
        id: langToId[lang] ?? 1,
        type: 'template',
        lang,
      },
      create: createTemplateInput,
      update: createTemplateInput,
    });

    return 'ok';
  }
}
