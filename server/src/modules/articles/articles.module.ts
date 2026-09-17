import { Module } from '@nestjs/common';
import { AiNewsroomModule } from '../ai-newsroom/ai-newsroom.module';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { ScheduledPublishTask } from './scheduled-publish.task';

@Module({
  imports: [AiNewsroomModule],
  controllers: [ArticlesController],
  providers: [ArticlesService, ScheduledPublishTask],
  exports: [ArticlesService],
})
export class ArticlesModule {}
