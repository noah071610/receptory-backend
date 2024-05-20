import {
  Controller,
  Post,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { HttpExceptionFilter } from 'src/filter/http-exception.filter';
import { UploadService } from './upload.service';

@UseFilters(new HttpExceptionFilter())
@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile()
    file: Express.Multer.File,
    // new ParseFilePipe({
    //   validators: [
    //     new MaxFileSizeValidator({ maxSize: 1000 }),
    //     new FileTypeValidator({ fileType: 'image/jpeg' }),
    //   ],
    // }),
  ) {
    const random_name =
      Array(32)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('') + extname(file.originalname);
    return await this.uploadService.upload(random_name, file.buffer);
  }
}
