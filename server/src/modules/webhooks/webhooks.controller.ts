import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';
import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks')
@ApiBearerAuth()
@Controller('admin/webhooks')
@RequirePermissions('webhooks.manage')
export class WebhooksController {
  constructor(private readonly webhooks: WebhooksService) {}

  @Get()
  @ResponseMessage('Webhooks')
  @ApiQuery({ name: 'agentId', required: false, description: 'Filter to webhooks owned by one agent' })
  list(@Query('agentId') agentId?: string) {
    return this.webhooks.list(agentId);
  }

  @Post()
  @ResponseMessage('Webhook created')
  @ApiOperation({ summary: 'Register a webhook; the response secret is shown once' })
  create(@Body() dto: CreateWebhookDto) {
    return this.webhooks.create(dto);
  }

  @Patch(':id')
  @ResponseMessage('Webhook updated')
  update(@Param('id') id: string, @Body() dto: UpdateWebhookDto) {
    return this.webhooks.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.webhooks.remove(id);
  }

  @Get(':id/deliveries')
  @ResponseMessage('Recent deliveries')
  deliveries(@Param('id') id: string) {
    return this.webhooks.deliveries(id);
  }
}
