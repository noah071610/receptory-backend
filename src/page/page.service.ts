import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { produce } from 'immer';
import { CachedService } from 'src/cache/cached.service';
import { cacheKeys } from 'src/cache/keys';
import { DatabaseService } from 'src/database/database.service';
import { ErrorMessage } from 'src/error/messages';
import {
  AnalyserType,
  Langs,
  SaveType,
  SelectedType,
  SelectedValueType,
} from 'src/types';

const initialAnalyser = {
  submit: {
    anyDate: 0,
    map: {},
  },
  calendar: {
    anyDate: 0,
    map: {},
  },
  time: {
    anytime: 0,
    map: {
      AM: Array.from({ length: 12 }, () => 0),
      PM: Array.from({ length: 12 }, () => 0),
    },
  },
  select: {},
  choices: {},
};

const removeEmptyProperties = (obj) => {
  return produce(obj, (draft) => {
    for (const key in draft) {
      if (draft[key] === '') {
        delete draft[key];
      }
    }
  });
};

function addDateCount(
  key: 'submit' | 'calendar',
  obj: AnalyserType,
  startDate: Date,
  endDate?: Date,
) {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date(startDate); // endDate가 없으면 startDate로 설정

  const _year = end.getFullYear();
  const _month = end.getMonth() + 1; // 월을 2자리 문자열로 변환
  const _date = end.getDate(); // 일을 2자리 문자열로 변환

  while (true) {
    const yearKey = start.getFullYear().toString();
    const monthKey = (start.getMonth() + 1).toString().padStart(2, '0');

    const year = start.getFullYear();
    const month = start.getMonth() + 1; // 월을 2자리 문자열로 변환
    const date = start.getDate(); // 일을 2자리 문자열로 변환

    if (!obj[key]['map'][`${yearKey}-${monthKey}`]) {
      obj[key]['map'][`${yearKey}-${monthKey}`] = Array.from(
        { length: 31 },
        () => 0,
      );
    }

    obj[key]['map'][`${yearKey}-${monthKey}`][date] += 1;

    // 연도 비교

    if (year >= _year && month >= _month && date >= _date) {
      break;
    }
    start.setDate(start.getDate() + 1);
  }
}

function convertTo24Hour(time: string) {
  const [hourMinute, period] = time.split(' ');
  // eslint-disable-next-line prefer-const
  let [hour, minute] = hourMinute.split(':').map((str) => parseInt(str, 10));

  if (period === 'AM' && hour === 12) hour = 0;
  if (period === 'PM' && hour !== 12) hour += 12;

  return { hour, minute: minute.toString().padStart(2, '0') };
}

function addTimesToObject(
  obj: AnalyserType,
  startTime: string,
  endTime: string,
) {
  const start = convertTo24Hour(startTime);
  const end = endTime ? convertTo24Hour(endTime) : start;

  for (let h = start.hour; h <= end.hour; h++) {
    const period = h < 12 ? 'AM' : 'PM';
    const hour = h % 12;

    obj.time['map'][period][hour] += 1;
  }
}

function addSelectCount(
  type: 'choices' | 'select',
  obj: AnalyserType,
  sectionId: string,
  values: SelectedValueType[],
) {
  if (!obj[type][sectionId]) obj[type][sectionId] = {};
  for (let i = 0; i < values.length; i++) {
    const { key } = values[i];
    obj[type][sectionId][key] = obj[type][sectionId][key]
      ? obj[type][sectionId][key] + 1
      : 1;
  }
}

const analyserCountMethodMap = {
  calendar: (obj: any, analyser: AnalyserType, value: SelectedValueType[]) => {
    if (value[0].key === 'anyDate') {
      analyser.calendar['anyDate']++;
      obj.anyDate = 1;
    } else {
      const start = new Date(value[0].text);
      const end = value[1] ? new Date(value[1].text) : undefined;

      obj.startDate = start;

      if (end) {
        obj.endDate = end;
      } else {
        obj.endDate = start;
      }

      addDateCount('calendar', analyser, start, end);
    }
  },
  time: (obj: any, analyser: AnalyserType, value: SelectedValueType[]) => {
    if (value[0].key === 'anytime') {
      analyser.time['anytime']++;
      obj.anytime = 1;
    } else {
      addTimesToObject(
        analyser,
        value[0].text,
        value[1] ? value[1].text : undefined,
      );
      const { hour, minute } = convertTo24Hour(value[0].text);
      obj.startTime = parseInt(`${hour}${minute}`);
      if (value[1]) {
        const { hour: endHour, minute: endMinute } = convertTo24Hour(
          value[1].text,
        );
        obj.endTime = parseInt(`${endHour}${endMinute}`);
      } else {
        obj.endTime = parseInt(`${hour}${minute}`);
      }
    }
  },
  choices: (
    obj: any,
    analyser: AnalyserType,
    value: SelectedValueType[],
    id: string,
  ) => {
    addSelectCount('choices', analyser, id, value);
    obj.text += `${value[0].text} `;
  },
  select: (
    obj: any,
    analyser: AnalyserType,
    value: SelectedValueType[],
    id: string,
  ) => {
    addSelectCount('select', analyser, id, value);
    obj.text += value.map(({ text }) => `${text} `).join('');
  },
  email: (obj: any, analyser: AnalyserType, value: SelectedValueType[]) => {
    obj.text += `${value[0].text} `;
  },
  nameInput: (obj: any, analyser: AnalyserType, value: SelectedValueType[]) => {
    obj.text += `${value[0].text} `;
  },
  phone: (obj: any, analyser: AnalyserType, value: SelectedValueType[]) => {
    obj.text += `${value[0].text.replaceAll('-', '')} `;
  },
};

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
        customLink: pageId,
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

  async getPageLink(pageId: string) {
    const page = await this.databaseService.page.findUnique({
      where: {
        pageId,
      },
      select: {
        customLink: true,
      },
    });

    return page ? page.customLink : null;
  }

  async findAllPages() {
    const allPages = await this.databaseService.page.findMany({
      select: {
        customLink: true,
        createdAt: true,
      },
    });
    return allPages;
  }

  async checkLink(pageId: string, customLink: string) {
    const page = await this.databaseService.page.findUnique({
      where: { customLink },
      select: {
        pageId: true,
      },
    });
    if (pageId === page?.pageId) return 'ok';

    return page ? 'no' : 'ok';
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

    const targetConfirmation =
      await this.databaseService.confirmation.findUnique({
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
    if (!targetConfirmation) {
      throw new HttpException(ErrorMessage.noPost, HttpStatus.NOT_FOUND);
    }

    const { content, password: targetPassword, createdAt } = targetConfirmation;

    const validatePassword = await bcrypt.compare(password, targetPassword);

    if (!validatePassword) {
      throw new HttpException(
        ErrorMessage.invalidEmail, //todo :
        HttpStatus.BAD_REQUEST,
      );
    }

    return { saveSelected: JSON.parse((content as string) ?? ''), createdAt };
  }

  async submit({
    selected,
    confirmId,
    pageId,
    password,
  }: {
    selected: SelectedType[];
    confirmId: string;
    pageId: string;
    password: string;
  }) {
    this.checkReservationData({ confirmId, pageId, password });

    if (!selected?.length) {
      throw new HttpException(ErrorMessage.unknown, HttpStatus.BAD_REQUEST);
    }

    const page = await this.databaseService.page.findUniqueOrThrow({
      where: { customLink: pageId }, // 업데이트 또는 생성할 사용자의 고유 식별자
      select: {
        analyser: true,
        userId: true,
        pageId: true,
      },
    });

    let analyser: AnalyserType = JSON.parse((page.analyser as string) ?? '');

    const date = new Date();

    if (!analyser || !analyser?.calendar) analyser = initialAnalyser;

    addDateCount('submit', analyser, date);

    const obj: any = {
      text: `${confirmId} `,
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
    };

    for (let i = 0; i < selected.length; i++) {
      const { value, type, id } = selected[i];
      if (!value[0] || !value[0]?.text) {
        throw new HttpException(ErrorMessage.unknown, HttpStatus.BAD_REQUEST);
      }
      if (analyserCountMethodMap[type]) {
        analyserCountMethodMap[type](obj, analyser, value, id);
      }
    }

    const hashed = await this.transformPassword(password);
    if (!hashed) {
      throw new HttpException(ErrorMessage.unknown, HttpStatus.BAD_REQUEST);
    }

    await this.databaseService.page.update({
      where: { customLink: pageId },
      data: {
        analyser: JSON.stringify(analyser),
      },
    });

    console.log(obj);

    await this.databaseService.confirmation.create({
      data: {
        confirmId,
        content: JSON.stringify(selected),
        password: hashed,
        // 페이지 아이디를 기반으로 찾음으로 customLink를 사용하지 않음
        pageId: page.pageId,
        userId: page.userId,
        ...removeEmptyProperties(obj),
        text: obj.text,
      },
    });

    return 'ok';
  }

  async deploy(pageDto: SaveType, userId: string) {
    const checkLink = await this.checkLink(pageDto.pageId, pageDto.customLink);
    if (checkLink === 'no') {
      throw new HttpException(
        ErrorMessage.existCustomLink,
        HttpStatus.BAD_REQUEST,
      );
    }
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
      create: {
        ...data,
        analyser: JSON.stringify(initialAnalyser),
      },
      update: data,
    });

    data.content = JSON.stringify(content);

    await this.databaseService.save.update({
      where: { userId, pageId }, // 업데이트 또는 생성할 사용자의 고유 식별자
      data,
    });

    await this.cacheManager.del(
      cacheKeys.page(pageContent.pageOptions.customLink),
    );
    await this.cacheManager.del(cacheKeys.page(pageId));

    return 'ok';
  }

  async inactivePage(pageId: string, userId: string) {
    const page = await this.databaseService.page.findUnique({
      where: {
        pageId,
        userId,
      },
    });
    if (page) {
      const pageContent = JSON.parse(page.content as string);

      await this.databaseService.page.update({
        where: {
          pageId,
          userId,
        },
        data: {
          format: 'inactive',
          content: JSON.stringify({
            ...pageContent,
            pageOptions: {
              ...pageContent.pageOptions,
              format: 'inactive',
            },
          }),
        },
      });
    }

    const save = await this.databaseService.save.findUnique({
      where: {
        pageId,
        userId,
      },
    });
    const saveContent = JSON.parse(save.content as string);

    await this.databaseService.save.update({
      where: {
        pageId,
        userId,
      },
      data: {
        format: 'inactive',
        content: JSON.stringify({
          ...saveContent,
          pageOptions: {
            ...saveContent.pageOptions,
            format: 'inactive',
          },
        }),
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
      const pageContent = JSON.parse(page.content as string);

      await this.databaseService.page.update({
        where: {
          pageId,
          userId,
        },
        data: {
          lang,
          content: JSON.stringify({
            ...pageContent,
            pageOptions: {
              ...pageContent.pageOptions,
              lang,
            },
          }),
        },
      });
    }

    const save = await this.databaseService.save.findUnique({
      where: {
        pageId,
        userId,
      },
    });
    const saveContent = JSON.parse(save.content as string);

    await this.databaseService.save.update({
      where: {
        pageId,
        userId,
      },
      data: {
        lang,
        content: JSON.stringify({
          ...saveContent,
          pageOptions: {
            ...saveContent.pageOptions,
            lang,
          },
        }),
      },
    });

    await this.cacheManager.del(cacheKeys.page(pageId));

    return 'ok';
  }
}
