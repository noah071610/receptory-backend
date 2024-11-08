import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { PayloadDto } from '../dto/payload.interface';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        RefreshJwtStrategy.extractJWT,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  private static extractJWT(req: any): string | null {
    if (req.cookies && req.cookies[process.env.COOKIE_NAME]) {
      return req.cookies[process.env.COOKIE_NAME];
    }
    return null;
  }

  async validate(payload: PayloadDto, done: VerifiedCallback): Promise<any> {
    const user = await this.authService.tokenValidateUser(payload);
    if (!user) {
      return done(
        new UnauthorizedException({ msg: 'user does not exist' }),
        false,
      );
    }
    return done(null, user);
  }
}
