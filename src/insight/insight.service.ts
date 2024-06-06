import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { prismaExclude } from 'src/config/database/prismaExclude';
import { DatabaseService } from 'src/database/database.service';
import { ErrorMessage } from 'src/error/messages';

@Injectable()
export class InsightService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getInsight(pageId: string, userId: string) {
    const existingPage = await this.databaseService.page.findUnique({
      where: {
        userId,
        pageId,
      },
      include: {
        confirmations: {
          take: 10,
          select: {
            ...prismaExclude('Confirmation', [
              'confirmId',
              'pageId',
              'password',
            ]),
          },
        },
      },
    });

    if (!existingPage)
      throw new HttpException(ErrorMessage.noPost, HttpStatus.NOT_FOUND);

    existingPage.content = JSON.parse(existingPage.content as string);
    existingPage.analyser = JSON.parse(existingPage.analyser as string);
    return existingPage;
  }
}
