import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { SearchService, type SearchType } from './search.service';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Public()
  @Get()
  @ResponseMessage('Search results')
  @ApiOperation({ summary: 'Full-text search across all published content' })
  @ApiQuery({ name: 'q', description: 'Search term; supports quoted phrases' })
  @ApiQuery({
    name: 'types',
    required: false,
    description: 'Comma-separated content types to restrict the search to',
  })
  @ApiQuery({ name: 'limit', required: false })
  run(@Query('q') q = '', @Query('types') types?: string, @Query('limit') limit?: string) {
    return this.search.search({
      term: q,
      types: types?.split(',').map(type => type.trim()) as SearchType[] | undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
