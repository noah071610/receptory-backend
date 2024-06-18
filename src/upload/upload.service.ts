import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorMessage } from 'src/error/messages';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  private readonly s3Client = new S3Client({
    region: this.configService.getOrThrow('AWS_S3_REGION'), // AWS 리전
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID, // AWS 액세스 키 ID
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // AWS 시크릿 액세스 키
    },
  });

  async uploadImage(fileName: string, file: Buffer) {
    const command = new PutObjectCommand({
      Bucket: this.configService.getOrThrow('AWS_BUCKET_NAME'),
      Key: `images/${fileName}`,
      Body: file,
    });
    try {
      await this.s3Client.send(command);
      return `https://${this.configService.getOrThrow('AWS_BUCKET_NAME')}.s3.${this.configService.getOrThrow('AWS_S3_REGION')}.amazonaws.com/images/desktop/${fileName}`;
    } catch {
      throw new HttpException(
        ErrorMessage.unknown,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async uploadImages(fileNames: string[], files: Buffer[]) {
    try {
      const srcArr = await Promise.all(
        files.map(async (file, i) => {
          try {
            const command = new PutObjectCommand({
              Bucket: this.configService.getOrThrow('AWS_BUCKET_NAME'),
              Key: `images/${fileNames[i]}`,
              Body: file,
            });
            await this.s3Client.send(command);
            return `https://${this.configService.getOrThrow('AWS_BUCKET_NAME')}.s3.${this.configService.getOrThrow('AWS_S3_REGION')}.amazonaws.com/images/desktop/${fileNames[i]}`;
          } catch (err) {
            console.log(err);
          }
        }),
      );

      return srcArr;
    } catch {
      throw new HttpException(
        ErrorMessage.unknown,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
