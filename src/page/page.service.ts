import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CachedService } from 'src/cache/cached.service';
import { cacheKeys } from 'src/cache/keys';
import { DatabaseService } from 'src/database/database.service';
import { ErrorMessage } from 'src/error/messages';
import { Langs, SaveType, UserPickType } from 'src/types';

@Injectable()
export class PageService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly cachedService: CachedService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async checkReservationData({
    confirmId,
    pageId,
    password,
  }: {
    confirmId: string;
    password: string;
    pageId: string;
  }) {
    if (!confirmId || !confirmId.trim()) {
      throw new HttpException(ErrorMessage.unknown, HttpStatus.BAD_REQUEST);
    }
    if (!password || !password.trim() || password.length < 5) {
      throw new HttpException(ErrorMessage.unknown, HttpStatus.BAD_REQUEST);
    }

    const page = await this.databaseService.page.findUnique({
      where: {
        pageId,
      },
    });
    if (!page) {
      throw new HttpException(ErrorMessage.noPost, HttpStatus.NOT_FOUND);
    }
  }

  async transformPassword(password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return hashed;
  }

  async findOnePage(pageId: string) {
    const page = await this.cachedService.getCachedPage(pageId);

    return page;
  }

  async findReservation({
    confirmId,
    pageId,
    password,
  }: {
    pageId: string;
    confirmId: string;
    password: string;
  }) {
    this.checkReservationData({ confirmId, pageId, password });

    const {
      content,
      password: targetPassword,
      createdAt,
    } = await this.databaseService.confirmation.findUnique({
      where: {
        confirmId,
        pageId,
      },
      select: {
        password: true,
        content: true,
        createdAt: true,
      },
    });

    const validatePassword = await bcrypt.compare(password, targetPassword);

    if (!validatePassword) {
      throw new HttpException(
        ErrorMessage.invalidEmail, //todo :
        HttpStatus.BAD_REQUEST,
      );
    }

    return { saveUserPick: JSON.parse((content as string) ?? ''), createdAt };
  }

  async submit({
    userPick,
    confirmId,
    pageId,
    password,
  }: {
    userPick: {
      [id: string]: UserPickType;
    };
    confirmId: string;
    pageId: string;
    password: string;
  }) {
    this.checkReservationData({ confirmId, pageId, password });

    const pickArr = Object.values(userPick);
    if (!pickArr?.length) {
      throw new HttpException(ErrorMessage.unknown, HttpStatus.BAD_REQUEST);
    }
    for (let i = 0; i < pickArr.length; i++) {
      const { title, value } = pickArr[i];
      if (!title || !value[0] || !value[0]?.text) {
        throw new HttpException(ErrorMessage.unknown, HttpStatus.BAD_REQUEST);
      }
    }

    const hashed = await this.transformPassword(password);
    if (!hashed) {
      throw new HttpException(ErrorMessage.unknown, HttpStatus.BAD_REQUEST);
    }

    await this.databaseService.confirmation.create({
      data: {
        confirmId,
        content: JSON.stringify(userPick),
        password: hashed,
        pageId,
      },
    });

    return 'ok';
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

    await this.databaseService.page.upsert({
      where: { userId, pageId }, // 업데이트 또는 생성할 사용자의 고유 식별자
      create: data,
      update: data,
    });

    data.content = JSON.stringify(content);

    await this.databaseService.save.update({
      where: { userId, pageId }, // 업데이트 또는 생성할 사용자의 고유 식별자
      data,
    });

    await this.cacheManager.del(cacheKeys.page(pageId));

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
