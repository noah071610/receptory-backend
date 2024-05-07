import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/passport.jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refreshToken.strategy';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshJwtStrategy, GoogleStrategy],
})
export class AuthModule {}
