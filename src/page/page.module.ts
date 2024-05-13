import { Module } from '@nestjs/common';
import { CachedService } from 'src/cache/cached.service';
import { PageController } from './page.controller';
import { PageService } from './page.service';

@Module({
  controllers: [PageController],
  providers: [PageService, CachedService],
})
export class PageModule {}
