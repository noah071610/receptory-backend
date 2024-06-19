import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { HttpExceptionFilter } from 'src/filter/http-exception.filter';
import { Langs, SaveType, SelectedType } from 'src/types';
import { PageService } from './page.service';

@UseFilters(new HttpExceptionFilter())
@Controller('api/page')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  findOnePage(@Query('pageId') pageId: string) {
    return this.pageService.findOnePage(pageId);
  }

  @Get('link')
  getPageLink(@Query('pageId') pageId: string) {
    return this.pageService.getPageLink(pageId);
  }

  @Get('all')
  findAll() {
    return this.pageService.findAllPages();
  }

  @Post('submit')
  submit(
    @Body()
    data: {
      selected: SelectedType[];
      confirmId: string;
      pageId: string;
      password: string;
    },
  ) {
    return this.pageService.submit(data);
  }

  @Post('find-reservation')
  findReservation(
    @Body()
    data: {
      pageId: string;
      confirmId: string;
      password: string;
    },
  ) {
    return this.pageService.findReservation(data);
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

  @UseGuards(AuthGuard)
  @Patch('lang')
  changeLang(
    @Query('pageId') pageId: string,
    @Query('lang') lang: Langs,
    @Req() req,
  ) {
    return this.pageService.changeLang(pageId, req.user.userId, lang);
  }

  @UseGuards(AuthGuard)
  @Get('check-link')
  checkLink(
    @Query('pageId') pageId: string,
    @Query('customLink') customLink: string,
  ) {
    return this.pageService.checkLink(pageId, customLink);
  }
}
