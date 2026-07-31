import { Module } from '@nestjs/common';
import { RegulationsController } from './regulations.controller';
import { RegulationsService } from './regulations.service';

@Module({
  controllers: [RegulationsController],
  providers: [RegulationsService],
  exports: [RegulationsService],
})
export class RegulationsModule {}
