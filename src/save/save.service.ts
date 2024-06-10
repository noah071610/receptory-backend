import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Save } from '@prisma/client';
import { cacheKeys } from 'src/cache/keys';
import { DatabaseService } from 'src/database/database.service';
import { ErrorMessage } from 'src/error/messages';
import { Langs } from 'src/types';
import getId from 'src/utils/getId';
import { saveSelector } from 'src/utils/selector';

@Injectable()
export class SaveService {
  constructor(
    private readonly databaseService: DatabaseService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getSave(pageId: string, userId: string) {
    const existingSaveData = await this.databaseService.save.findUnique({
      where: {
        userId,
        pageId,
      },
    });

    if (!existingSaveData)
      throw new HttpException(ErrorMessage.noPost, HttpStatus.NOT_FOUND);

    existingSaveData.content = JSON.parse(existingSaveData.content as string);
    return existingSaveData;
  }

  async addSave(userId: string, lang: Langs) {
    const newId = getId();
    const newSave = await this.databaseService.save.create({
      data: {
        pageId: newId,
        thumbnail: '',
        title: '',
        description: '',
        format: 'inactive',
        lang,
        customLink: newId,
        user: {
          connect: {
            userId,
          },
        },
        content: JSON.stringify({
          stage: 'init',
        }),
      },
      select: saveSelector,
    });
    return newSave;
  }

  async getSaves(userId: string) {
    const saves = await this.databaseService.save.findMany({
      where: {
        userId,
      },
      select: saveSelector,
    });

    return saves;
  }

  async save(data: Save, userId: string) {
    await this.databaseService.save.update({
      where: { userId, pageId: data.pageId }, // 업데이트 또는 생성할 사용자의 고유 식별자
      data: {
        ...data,
        content: JSON.stringify(data.content),
      },
    });

    return 'ok';
  }

  async delete(pageId: string, userId: string) {
    await this.databaseService.save.delete({
      where: { userId, pageId },
    });
    await this.cacheManager.del(cacheKeys.page(pageId));

    return 'ok';
  }

  async checkLink(customLink: string) {
    const save = await this.databaseService.save.findUnique({
      where: { pageId: customLink },
      select: {
        pageId: true,
      },
    });
    const page = await this.databaseService.page.findUnique({
      where: { pageId: customLink },
      select: {
        pageId: true,
      },
    });

    return save || page ? 'no' : 'ok';
  }
}
