import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { prismaExclude } from 'src/config/database/prismaExclude';
import { DatabaseService } from 'src/database/database.service';

import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ErrorMessage } from 'src/error/messages';
import { saveSelector } from 'src/utils/selector';
import { PayloadDto, PayloadForValidateDto } from './dto/payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async transformPassword(user: Prisma.UserCreateInput) {
    const hashed = await bcrypt.hash(user.password, 10);
    return hashed;
  }

  async register(userDTO: Prisma.UserCreateInput, accessToken?: string) {
    if (!userDTO.userName.trim()) {
      throw new HttpException(
        { msg: ErrorMessage.noUserName, data: 'userName' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      !userDTO.email.match(
        /^([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,})$/,
      )
    ) {
      throw new HttpException(
        { msg: ErrorMessage.invalidEmail, data: 'email' },
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!userDTO.email.trim()) {
      throw new HttpException(
        { msg: ErrorMessage.noEmail, data: 'email' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (userDTO.provider === 'local' && !userDTO.password.trim()) {
      throw new HttpException(
        { msg: ErrorMessage.noPassword, data: 'password' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const findUser = await this.databaseService.user.findUnique({
      where: {
        email: userDTO.email,
      },
    });

    if (findUser) {
      if (accessToken) {
        // 소셜 전략에서 저장한 accessToken을 확인
        // await this.cacheManager.set(accessToken, email);
        // 이걸로 보관했다!!
        const emailCache = await this.cacheManager.get(accessToken);
        // 여기서 레디스 캐시를 지우지 않는다!!!!! 왜냐고? login 에서 쓸거니까 ㅎㅎ
        if (emailCache) {
          // 너 이미 아이디 있잖아. 니 아이디 반납하고 로그인 하러가
          return {
            msg: 'ok',
            accessToken,
            user: findUser,
          };
        } else {
          // 뭐야 소셜 인증하면 토큰 저장 하는데 왜 없어? 모르겠는 에러..
          throw new HttpException(
            { msg: ErrorMessage.unknown, data: 'unknown' },
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      }

      // 이미 있는 이메일
      throw new HttpException(ErrorMessage.existEmail, HttpStatus.CONFLICT);
    } else {
      const password = userDTO.password
        ? await this.transformPassword(userDTO)
        : undefined;

      const createUser = await this.databaseService.user.create({
        data: { ...userDTO, password },
      });
      return {
        msg: 'ok',
        accessToken,
        user: createUser,
      };
    }
  }

  async validateUser({
    email,
    provider,
    accessToken,
    password,
  }: PayloadForValidateDto) {
    const findUser = await this.databaseService.user.findUnique({
      where: {
        email,
      },
    });

    if (!findUser) {
      // 아이디 없는데 어캐 로그인하누
      throw new HttpException(
        ErrorMessage.loginFailBadRequest,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (provider === 'local' && findUser.provider !== 'local') {
      // 너 소셜 로그인인데 왜 로컬로그인해 ㅠㅠ 소셜 로그인으로 해라
      throw new HttpException(
        { msg: ErrorMessage.existEmail, data: findUser.provider },
        HttpStatus.CONFLICT,
      );
    }

    if (provider !== 'local') {
      // 소셜 로그인이네요?
      const emailCache = await this.cacheManager.get(accessToken);
      // 드디어 지우는 토큰 캐시.. 계정 생성때 삭제 안한 보람이 있네
      await this.cacheManager.del(accessToken);

      if (emailCache !== email) {
        // 왜 이메일 달라? 이건 진짜 어이없는 오류. 나도 몰라 내 잘못
        throw new HttpException(ErrorMessage.unknown, HttpStatus.BAD_REQUEST);
      }
    } else {
      // 소셜 로그인이 아니시네요?
      if (!password?.trim())
        // 패스워드가 왜 없누.... 아마 소셜로그인 아니면  오류?
        throw new HttpException(
          ErrorMessage.loginFailBadRequest,
          HttpStatus.BAD_REQUEST,
        );
      const validatePassword = await bcrypt.compare(
        password,
        findUser.password,
      );

      if (!validatePassword) {
        // 비번 다름 ㅋ
        throw new HttpException(
          ErrorMessage.loginFailBadRequest,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    const payload: PayloadDto = {
      userId: findUser.userId,
      email: findUser.email,
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: exclude, ...rest } = findUser;

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
        expiresIn: '15m',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: '30d',
      }),
      user: rest,
      msg: 'ok',
    };
  }

  async tokenValidateUser(payload: PayloadDto): Promise<any | undefined> {
    return await this.databaseService.user.findUnique({
      where: {
        userId: payload.userId,
        email: payload.email,
      },
      select: {
        ...prismaExclude('User', ['password']),
      },
    });
  }

  async findUserSaves(userId: number) {
    const saves = await this.databaseService.save.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      select: saveSelector,
    });

    return saves;
  }

  async refreshToken(user: User) {
    const payload: PayloadDto = {
      userId: user.userId,
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
        expiresIn: '15m',
      }),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    };
  }
}
