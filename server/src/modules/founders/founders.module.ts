import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { FoundersController } from './founders.controller';
import { FoundersService } from './founders.service';

@Module({
  imports: [MediaModule],
  controllers: [FoundersController],
  providers: [FoundersService],
  exports: [FoundersService],
})
export class FoundersModule {}
