import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { Save } from '@prisma/client';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { HttpExceptionFilter } from 'src/filter/http-exception.filter';
import { Langs } from 'src/types';
import { SaveService } from './save.service';

@UseFilters(new HttpExceptionFilter())
@Controller('api/save')
export class SaveController {
  constructor(private readonly saveService: SaveService) {}

  @UseGuards(AuthGuard)
  @Get()
  getSave(@Query('pageId') pageId: string, @Req() req) {
    return this.saveService.getSave(pageId, req.user.userId);
  }

  // new post flow
  @UseGuards(AuthGuard)
  @Post()
  addSave(@Query('lang') lang: Langs, @Req() req) {
    return this.saveService.addSave(req.user.userId, lang);
  }

  @UseGuards(AuthGuard)
  @Get('list')
  getSaves(@Req() req) {
    return this.saveService.getSaves(req.user.userId);
  }

  @UseGuards(AuthGuard)
  @Put()
  save(@Body() data: Save, @Req() req) {
    return this.saveService.save(data, req.user.userId);
  }

  @UseGuards(AuthGuard)
  @Delete()
  delete(@Query('pageId') pageId: string, @Req() req) {
    return this.saveService.delete(pageId, req.user.userId);
  }

  @UseGuards(AuthGuard)
  @Get('check-link')
  checkLink(@Query('customLink') customLink: string) {
    return this.saveService.checkLink(customLink);
  }
}
