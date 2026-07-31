import { Module } from '@nestjs/common';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ScheduledPublishTask } from './scheduled-publish.task';

@Module({
  controllers: [ArticlesController],
  providers: [ArticlesService, ScheduledPublishTask],
  exports: [ArticlesService],
})
export class ArticlesModule {}
