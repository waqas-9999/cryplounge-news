import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { DiscoveryService, type DiscoveryKey } from './discovery.service';

@ApiTags('Discovery')
@Controller()
export class DiscoveryController {
  constructor(private readonly discovery: DiscoveryService) {}

  @Public()
  @Get('home')
  @ResponseMessage('Homepage sections')
  @ApiOperation({
    summary: 'Every enabled homepage section, in admin-configured order, with content resolved',
  })
  home() {
    return this.discovery.homepage();
  }

  @Public()
  @Get('discovery/:key')
  @ResponseMessage('Section content')
  @ApiOperation({ summary: 'Resolve a single discovery section' })
  @ApiQuery({ name: 'limit', required: false })
  section(@Param('key') key: DiscoveryKey, @Query('limit') limit?: string) {
    return this.discovery.resolve(key, limit ? Number(limit) : undefined);
  }
}
