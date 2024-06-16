import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';

// somewhere in your initialization file

// eslint-disable-next-line @typescript-eslint/no-var-requires
const hpp = require('hpp');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const session = require('express-session');

const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: isProduction ? process.env.CLIENT : true, // 허용할 도메인 (또는 true로 설정하여 모든 도메인 허용)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // 자격 증명(쿠키 등)을 포함한 요청 허용
    maxAge: 3600, // 프리플라이트(Pre-flight) 요청의 최대 지속 시간을 지정합니다.
  });

  if (isProduction) {
    app.use(hpp());
    app.use(helmet({ contentSecurityPolicy: false }));
  }

  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.use(
    session({
      saveUninitialized: false,
      resave: false,
      secret: process.env.COOKIE_SECRET,
      proxy: isProduction,
      cookie: {
        httpOnly: isProduction,
        secure: isProduction,
        domain: isProduction ? `.${process.env.DOMAIN}` : 'localhost',
      },
    }),
  );

  await app.listen(process.env.PORT);
}
bootstrap();
