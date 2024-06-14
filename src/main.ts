import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as csurf from 'csurf';
import helmet from 'helmet';
import { AppModule } from './app.module';

// somewhere in your initialization file

// eslint-disable-next-line @typescript-eslint/no-var-requires
const hpp = require('hpp');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const session = require('express-session');

const isProduction = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: isProduction ? ['https://receptory.com'] : true, // 원하는 허용된 오리진을 지정합니다.
      // methods: ['GET', 'POST'], // 허용할 HTTP 메서드를 지정합니다.
      allowedHeaders: ['Content-Type', 'Authorization'], // 허용할 헤더를 지정합니다.
      credentials: true, // 자격 증명 헤더를 허용합니다.
      maxAge: 3600, // 프리플라이트(Pre-flight) 요청의 최대 지속 시간을 지정합니다.
    },
  });

  if (isProduction) {
    app.use(csurf());
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
        domain: isProduction && '.receptory.com',
      },
    }),
  );

  await app.listen(5555);
}
bootstrap();
