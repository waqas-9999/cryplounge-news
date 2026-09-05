import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { ImageryClient } from './imagery.client';
import { ImageryController } from './imagery.controller';

@Module({
  imports: [MediaModule],
  controllers: [ImageryController],
  providers: [ImageryClient],
  exports: [ImageryClient],
})
export class ImageryModule {}
