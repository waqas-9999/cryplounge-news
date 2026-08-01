import { OmitType } from '@nestjs/swagger';
import { CreateArticleDto } from '../../articles/dto/article.dto';

/**
 * What an agent may submit for an article.
 *
 * Identical to `CreateArticleDto` minus `status`: an agent's publish status
 * is derived from its `defaultPublishMode` and `news.publish` grant, not
 * chosen by the caller — see `AgentsService.submitArticle`.
 */
export class SubmitArticleDto extends OmitType(CreateArticleDto, ['status'] as const) {}
