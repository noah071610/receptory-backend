import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CachedService } from './cache/cached.service';
import { DatabaseModule } from './database/database.module';
import { InsightModule } from './insight/insight.module';
import { TransformInterceptor } from './interceptor/transform.interceptor';
import { PageModule } from './page/page.module';
import { SaveModule } from './save/save.module';
import { UploadModule } from './upload/upload.module';
import { WebsiteModule } from './website/website.module';

// memo: 라이브러리 특성상 어쩔 수 없다.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const redisStore = require('cache-manager-redis-store').redisStore;

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
      store: redisStore,
    }),
    JwtModule.register({
      global: true,
    }),
    PassportModule,
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UploadModule,
    AuthModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.getOrThrow('THROTTLE_TTL'),
          limit: config.getOrThrow('THROTTLE_LIMIT'),
        },
      ],
    }),
    PageModule,
    SaveModule,
    InsightModule,
    WebsiteModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    CachedService,
  ],
})
export class AppModule {}
