import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Save } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ErrorMessage } from 'src/error/messages';
import { Langs } from 'src/types';
import getId from 'src/utils/getId';
import { saveSelector } from 'src/utils/selector';

@Injectable()
export class SaveService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getSave(pageId: string, userId: number) {
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

  async addSave(userId: number, lang: Langs) {
    const newId = getId();
    const newSave = await this.databaseService.save.create({
      data: {
        pageId: newId,
        thumbnail: '',
        title: '',
        description: '',
        format: 'inactive',
        lang,
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

  async save(data: Save, userId: number) {
    await this.databaseService.save.update({
      where: { userId, pageId: data.pageId }, // 업데이트 또는 생성할 사용자의 고유 식별자
      data: {
        ...data,
        content: JSON.stringify(data.content),
      },
    });

    return 'ok';
  }
}
