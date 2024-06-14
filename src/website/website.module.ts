import { Module } from '@nestjs/common';
import { CachedService } from 'src/cache/cached.service';
import { WebsiteController } from './website.controller';
import { WebsiteService } from './website.service';

@Module({
  controllers: [WebsiteController],
  providers: [WebsiteService, CachedService],
})
export class WebsiteModule {}
