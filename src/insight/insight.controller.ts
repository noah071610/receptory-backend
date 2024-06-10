import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { InsightService } from './insight.service';

@Controller('api/insight')
export class InsightController {
  constructor(private readonly insightService: InsightService) {}

  @UseGuards(AuthGuard)
  @Get()
  getInsight(@Query('pageId') pageId: string, @Req() req) {
    return this.insightService.getInsight(pageId, req.user.userId);
  }

  @UseGuards(AuthGuard)
  @Post('/confirmations')
  getConfirmations(@Body() data: any, @Req() req) {
    return this.insightService.getConfirmations(data, req.user.userId);
  }
}
