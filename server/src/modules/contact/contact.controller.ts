import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { ContactService } from './contact.service';
import { ContactQueryDto, SubmitContactDto } from './dto/contact.dto';

@ApiTags('Contact')
@Controller()
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Public()
  @Post('contact')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Submit the public Contact Us form' })
  submit(@Body() dto: SubmitContactDto) {
    return this.contact.submit(dto);
  }

  @Get('admin/contact')
  @ApiBearerAuth()
  @RequirePermissions('contact.read')
  @ResponseMessage('Contact messages')
  @ApiOperation({ summary: 'List Contact Us submissions' })
  list(@Query() query: ContactQueryDto) {
    return this.contact.list(query);
  }

  @Get('admin/contact/unread-count')
  @ApiBearerAuth()
  @RequirePermissions('contact.read')
  @ResponseMessage('Unread count')
  unreadCount() {
    return this.contact.unreadCount().then(count => ({ count }));
  }

  @Patch('admin/contact/:id/read')
  @ApiBearerAuth()
  @RequirePermissions('contact.manage')
  @ResponseMessage('Message updated')
  markRead(@Param('id') id: string, @Body('read') read: boolean) {
    return this.contact.markRead(id, read ?? true);
  }

  @Delete('admin/contact/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @RequirePermissions('contact.manage')
  remove(@Param('id') id: string) {
    return this.contact.remove(id);
  }
}
