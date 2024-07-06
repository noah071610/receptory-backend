import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
    });

    if (!existingPage)
      throw new HttpException(ErrorMessage.noPost, HttpStatus.NOT_FOUND);

    existingPage.content = JSON.parse(existingPage.content as string);
    existingPage.analyser = JSON.parse(existingPage.analyser as string);
    return existingPage;
  }

  async getConfirmations(
    {
      cursor,
      pageId,
      curFilter: { endQuery, startQuery, type: filterType, isAnyDateOrAnytime },
      curSort: { orderby, sort },
      searchInput,
    }: {
      cursor: any;
      pageId: string;
      searchInput: string;
      curFilter: {
        type: string;
        startQuery: string;
        endQuery: string;
        isAnyDateOrAnytime: boolean;
      };
      curSort: {
        orderby: 'desc' | 'asc';
        sort: string;
      };
    },
    userId: string,
  ) {
    const where: any = { pageId, userId };

    if (filterType !== 'none') {
      switch (filterType) {
        case 'createdAt':
          const lteEnd = new Date(endQuery);
          lteEnd.setHours(23, 59, 0, 0);

          if (startQuery) {
            where.createdAt = { gte: new Date(startQuery) };
          }
          if (endQuery) {
            where.createdAt = {
              ...where.createdAt,
              lte: lteEnd,
            };
          }
          break;
        case 'calendar':
          if (isAnyDateOrAnytime) {
            where.anyDate = 1;
            break;
          }
          if (startQuery) {
            where.startDate = { gte: new Date(startQuery) };
          }
          if (endQuery) {
            where.endDate = { lte: new Date(endQuery) };
          }
          break;
        case 'time':
          if (isAnyDateOrAnytime) {
            where.anytime = 1;
            break;
          }
          if (startQuery) {
            where.startTime = { gte: parseInt(startQuery.replace(':', '')) };
          }
          if (endQuery) {
            where.endTime = { lte: parseInt(endQuery.replace(':', '')) };
          }
          break;
      }
    }
    if (searchInput) {
      where.text = { contains: searchInput };
    }

    const existingConfirmations =
      await this.databaseService.confirmation.findMany({
        where,
        take: 20,
        skip: 20 * parseInt(cursor) ?? 0, // 커서 항목을 건너뛰기 위해 skip 사용
        select: {
          confirmId: true,
          content: true,
          isConfirm: true,
          createdAt: true,
        },
        orderBy: {
          [sort]: orderby,
        },
      });

    return existingConfirmations;
  }
}
