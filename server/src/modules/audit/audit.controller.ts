import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AuditLogService } from './audit-log.service';
import { AuditQueryDto } from './dto/audit.dto';

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditLogService) {}

  @Get()
  @RequirePermissions('audit.read')
  @ResponseMessage('Audit log')
  @ApiOperation({ summary: 'Search the audit log by action, entity, actor or date' })
  list(@Query() query: AuditQueryDto) {
    return this.audit.list(query);
  }

  @Get('recent')
  @RequirePermissions('audit.read')
  @ResponseMessage('Recent activity')
  recent() {
    return this.audit.recent();
  }

  @Get('failed-logins')
  @RequirePermissions('audit.read')
  @ResponseMessage('Failed sign-in attempts')
  @ApiOperation({ summary: 'Failed sign-ins in the last 24 hours, grouped by account and address' })
  failedLogins() {
    return this.audit.failedLogins();
  }

  @Get(':entity/:entityId')
  @RequirePermissions('audit.read')
  @ResponseMessage('Activity timeline')
  @ApiOperation({ summary: 'Every change to one record, newest first' })
  timeline(@Param('entity') entity: string, @Param('entityId') entityId: string) {
    return this.audit.timeline(entity, entityId);
  }
}
