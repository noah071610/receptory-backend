import {
  Body,
  Controller,
  Get,
  Post,
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
  RegisterUserDto,
} from './dto/payload.interface';
import { AuthGuard } from './guards/auth.guard';
import { GoogleOauthGuard } from './guards/google-oauth.guard';
import { RefreshJwtGuard } from './guards/refresh-jwt-auth.guard';

const getUserRes = (user: User) => {
  return {
    userId: user.userId,
    userName: user.userName,
    userImage: user.userImage,
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

  @UseGuards(AuthGuard)
  @Get('saves')
  findUserSaves(@Req() req) {
    return this.authService.findUserSaves(req.user.userId);
  }

  @Post()
  async register(@Body() data: RegisterUserDto, @Res() res: Response) {
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
    res.cookie('sawatdee-cookie', refreshToken, {
      httpOnly: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 * 30, //30 day
    });

    return res.redirect(`http://localhost:3000/user/${user.userId}`);
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response): any {
    res.cookie('jwt', '', {
      maxAge: 0,
    });
    return res.send({});
  }

  // GOOGLE
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  googleLogin(@Res() res: Response) {
    return res.redirect('/google/callback');
  }

  @UseGuards(GoogleOauthGuard)
  @Get('google/callback')
  async googleLoginCallback(@Req() req, @Res() res: Response) {
    // 1) google 인증 종료 새 계정 생성으로
    await this.register(req.user as RegisterUserDto, res);
  }
}
