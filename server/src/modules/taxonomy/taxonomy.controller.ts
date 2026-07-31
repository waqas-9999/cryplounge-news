import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CategoryKind } from '@prisma/client';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import {
  CreateCategoryDto,
  CreateLabelDto,
  CreateTagDto,
  MergeTagsDto,
  UpdateCategoryDto,
  UpdateLabelDto,
  UpdateTagDto,
} from './dto/taxonomy.dto';
import { TaxonomyService } from './taxonomy.service';

/**
 * Reads are public — the site renders category and tag lists on every page.
 * Writes require the `taxonomy.manage` permission.
 */
@ApiTags('Taxonomy')
@Controller('taxonomy')
export class TaxonomyController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  /* ---------------------------------------------------------- categories --- */

  @Public()
  @Get('categories')
  @ResponseMessage('Categories')
  @ApiOperation({ summary: 'List categories, optionally for one content type' })
  @ApiQuery({ name: 'kind', enum: CategoryKind, required: false })
  listCategories(@Query('kind') kind?: CategoryKind) {
    return this.taxonomy.listCategories(kind);
  }

  @Post('categories')
  @ApiBearerAuth()
  @RequirePermissions('taxonomy.manage')
  @ResponseMessage('Category created')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.taxonomy.createCategory(dto);
  }

  @Patch('categories/:id')
  @ApiBearerAuth()
  @RequirePermissions('taxonomy.manage')
  @ResponseMessage('Category updated')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.taxonomy.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('taxonomy.manage')
  @ApiOperation({ summary: 'Delete a category; content is detached, not deleted' })
  deleteCategory(@Param('id') id: string) {
    return this.taxonomy.deleteCategory(id);
  }

  /* ---------------------------------------------------------------- tags --- */

  @Public()
  @Get('tags')
  @ResponseMessage('Tags')
  @ApiQuery({ name: 'search', required: false })
  listTags(@Query('search') search?: string) {
    return this.taxonomy.listTags(search);
  }

  @Post('tags')
  @ApiBearerAuth()
  @RequirePermissions('taxonomy.manage')
  @ResponseMessage('Tag created')
  createTag(@Body() dto: CreateTagDto) {
    return this.taxonomy.createTag(dto);
  }

  @Patch('tags/:id')
  @ApiBearerAuth()
  @RequirePermissions('taxonomy.manage')
  @ResponseMessage('Tag updated')
  updateTag(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    return this.taxonomy.updateTag(id, dto);
  }

  @Post('tags/merge')
  @ApiBearerAuth()
  @RequirePermissions('taxonomy.manage')
  @ResponseMessage('Tags merged')
  @ApiOperation({ summary: 'Move all content from one tag to another, then delete the source' })
  mergeTags(@Body() dto: MergeTagsDto) {
    return this.taxonomy.mergeTags(dto.sourceId, dto.targetId);
  }

  @Delete('tags/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('taxonomy.manage')
  deleteTag(@Param('id') id: string) {
    return this.taxonomy.deleteTag(id);
  }

  /* -------------------------------------------------------------- labels --- */

  @Public()
  @Get('labels')
  @ResponseMessage('Labels')
  listLabels() {
    return this.taxonomy.listLabels();
  }

  @Post('labels')
  @ApiBearerAuth()
  @RequirePermissions('taxonomy.manage')
  @ResponseMessage('Label created')
  createLabel(@Body() dto: CreateLabelDto) {
    return this.taxonomy.createLabel(dto);
  }

  @Patch('labels/:id')
  @ApiBearerAuth()
  @RequirePermissions('taxonomy.manage')
  @ResponseMessage('Label updated')
  updateLabel(@Param('id') id: string, @Body() dto: UpdateLabelDto) {
    return this.taxonomy.updateLabel(id, dto);
  }

  @Delete('labels/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('taxonomy.manage')
  deleteLabel(@Param('id') id: string) {
    return this.taxonomy.deleteLabel(id);
  }
}
