import { Module } from '@nestjs/common';
import { InsightService } from './insight.service';
import { InsightController } from './insight.controller';

@Module({
  controllers: [InsightController],
  providers: [InsightService],
})
export class InsightModule {}
