import { Module } from '@nestjs/common';
import { SaveService } from './save.service';
import { SaveController } from './save.controller';

@Module({
  controllers: [SaveController],
  providers: [SaveService],
})
export class SaveModule {}
