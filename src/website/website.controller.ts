import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { HttpExceptionFilter } from 'src/filter/http-exception.filter';
import { Langs } from 'src/types';
import { WebsiteService } from './website.service';

@UseFilters(new HttpExceptionFilter())
@Controller('api/website')
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  @UseGuards(AdminGuard)
  @Post('template')
  setTemplates(
    @Body()
    data: {
      text: string;
      lang: Langs;
    },
  ) {
    return this.websiteService.setTemplates(data);
  }

  @Get('template')
  getTemplate(@Query('pageId') pageId: string) {
    return this.websiteService.getTemplate(pageId);
  }

  @UseGuards(AuthGuard)
  @Post('template/use')
  useTemplate(@Query('templateId') templateId: string, @Req() req) {
    return this.websiteService.useTemplate(templateId, req.user.userId);
  }

  @UseGuards(AdminGuard)
  @Get('template-text')
  getTemplateText(@Query('lang') lang: Langs, @Query('type') type: 'template') {
    return this.websiteService.getTemplateText({ lang, type });
  }

  @Get('templates') // 복수
  getTemplates(@Query('lang') lang: Langs) {
    return this.websiteService.getTemplates(lang);
  }
}
