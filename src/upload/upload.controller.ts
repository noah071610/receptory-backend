import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { HttpExceptionFilter } from 'src/filter/http-exception.filter';
import { UploadService } from './upload.service';

@UseFilters(new HttpExceptionFilter())
@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 }),
          new FileTypeValidator({ fileType: 'image/jpeg' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    // const random_name =
    //   Array(32)
    //     .fill(null)
    //     .map(() => Math.round(Math.random() * 16).toString(16))
    //     .join('') + extname(file.originalname);
    // return await this.uploadService.uploadImage(random_name, file.buffer);
    return '';
  }

  @Post('images')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadImages(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2000000 }),
          new FileTypeValidator({ fileType: 'image' }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    // const fileNames = files.map(
    //   (v) =>
    //     Array(32)
    //       .fill(null)
    //       .map(() => Math.round(Math.random() * 16).toString(16))
    //       .join('') + extname(v.originalname),
    // );

    // return await this.uploadService.uploadImages(
    //   fileNames,
    //   files.map((v) => v.buffer),
    // );
    return [''];
  }
}
