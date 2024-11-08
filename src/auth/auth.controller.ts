import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { HttpExceptionFilter } from 'src/filter/http-exception.filter';
import { AuthService } from './auth.service';
import {
  PayloadForValidateDto,
  UserAuthPayload,
} from './dto/payload.interface';
import { AuthGuard } from './guards/auth.guard';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt-auth.guard';

const getUserRes = (user: User) => {
  return {
    email: user.email,
    userId: user.userId,
    userName: user.userName,
    userImage: user.userImage,
    color: user.color,
    provider: user.provider,
    plan: user.plan,
    createdAt: user.createdAt,
  };
};

@UseFilters(new HttpExceptionFilter())
@Controller('api/auth/')
export class AuthController {
  constructor(private authService: AuthService) {}

  // GET
  @UseGuards(RefreshJwtGuard)
  @Get('refresh')
  async refreshToken(@Req() req, @Res() res: Response) {
    const jwt = await this.authService.refreshToken(req.user);

    res.setHeader('Authorization', 'Bearer ' + jwt.accessToken);

    return res.send({
      accessToken: jwt.accessToken,
      user: getUserRes(req.user),
    });
  }

  @UseGuards(AuthGuard)
  @Get()
  isAuthenticated(@Req() req) {
    return getUserRes(req.user);
  }

  @Post()
  async register(@Body() data: UserAuthPayload, @Res() res: Response) {
    const { accessToken, ...user } = data;

    // 2) 새로운 계정 생성
    const registerRes = await this.authService.register(user, accessToken);

    // 3) 계정 있으면 가져왔고, 계정 없으면 만들었고!
    // 그래서 로그인으로 가자
    await this.login(
      {
        email: registerRes.user.email,
        password: user.password,
        provider: user.provider,
        accessToken,
      },
      res,
    );
  }

  @UseGuards(AuthGuard)
  @Post('profile')
  async changeProfile(
    @Req() req,
    @Body() data: { userName: string; color: string },
  ) {
    return await this.authService.changeProfile(data, req.user.userId);
  }

  @Post('login')
  async login(
    @Body()
    payload: PayloadForValidateDto,
    @Res() res: Response,
  ) {
    // 4) 로그인은 일단 검증이 필요함. 소셜으로 로그인 했든 버튼으로 뭐든
    // 다시 인증하러 갑시다 ㅠ
    const { user, accessToken, refreshToken } =
      await this.authService.validateUser(payload);

    res.setHeader('Authorization', 'Bearer ' + accessToken);
    res.cookie(process.env.COOKIE_NAME, refreshToken, {
      httpOnly: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 * 30, //30 day
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.DOMAIN
          : 'localhost',
    });
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

    return res.redirect(
      `${process.env.NODE_ENV === 'production' ? process.env.CLIENT : process.env.LOCAL_CLIENT}/login-success?userId=${user.userId}`,
    );
  }

  @UseGuards(AuthGuard)
  @Post('logout')
  logout(@Res() res: Response): any {
    res.cookie(process.env.COOKIE_NAME, '', {
      httpOnly: process.env.NODE_ENV === 'production',
      maxAge: 0,
      domain:
        process.env.NODE_ENV === 'production'
          ? process.env.DOMAIN
          : 'localhost',
    });

    return res.send('ok');
  }

  @UseGuards(AuthGuard)
  @Delete()
  deleteUser(@Query('feedback') feedback: string, @Req() req: Request): any {
    return this.authService.deleteUser(req.user as User, feedback);
  }

  // GOOGLE
  @UseGuards(GoogleOauthGuard)
  @Get('google')
  googleLogin(@Res() res: Response) {
    return res.redirect('/google/callback');
  }

  @UseGuards(GoogleOauthGuard)
  @Get('google/callback')
  async googleLoginCallback(@Req() req, @Res() res: Response) {
    // 1) google 인증 종료 새 계정 생성으로
    // 이미 가입된 유저라도 걸러서 로그인으로 보내줌.
    await this.register(req.user, res);
  }
}
