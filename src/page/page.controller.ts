import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { SaveType } from 'src/types';
import { PageService } from './page.service';

@Controller('api/page')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  findOnePage(@Query('pageId') pageId: string) {
    return this.pageService.findOnePage(pageId);
  }

  @UseGuards(AuthGuard)
  @Post()
  deploy(@Body() data: SaveType, @Req() req) {
    return this.pageService.deploy(data, req.user.userId);
  }

  @UseGuards(AuthGuard)
  @Patch('inactive')
  inactivePage(@Query('pageId') pageId: string, @Req() req) {
    return this.pageService.inactivePage(pageId, req.user.userId);
  }
}
