import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { RequirePermissions } from '../auth/decorators/require-permissions.decorator';
import { AgentsService } from './agents.service';
import { CreateAgentDto, UpdateAgentDto } from './dto/agent.dto';

@ApiTags('AI Agents')
@ApiBearerAuth()
@Controller('admin/agents')
@RequirePermissions('agents.manage')
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}

  @Get()
  @ResponseMessage('Agents')
  list() {
    return this.agents.list();
  }

  @Get(':id')
  @ResponseMessage('Agent')
  findById(@Param('id') id: string) {
    return this.agents.findById(id);
  }

  @Post()
  @ResponseMessage('Agent created')
  @ApiOperation({ summary: 'Register a new agent; the response secret is shown once' })
  create(@Body() dto: CreateAgentDto) {
    return this.agents.create(dto);
  }

  @Patch(':id')
  @ResponseMessage('Agent updated')
  update(@Param('id') id: string, @Body() dto: UpdateAgentDto) {
    return this.agents.update(id, dto);
  }

  @Post(':id/regenerate-secret')
  @ResponseMessage('Secret regenerated')
  @ApiOperation({ summary: 'Issues a new secret and invalidates the old one immediately' })
  regenerateSecret(@Param('id') id: string) {
    return this.agents.regenerateSecret(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.agents.remove(id);
  }

  @Get(':id/requests')
  @ResponseMessage('Recent requests')
  @ApiQuery({ name: 'limit', required: false, description: 'Max requests to return' })
  requests(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.agents.recentRequests(id, limit ? Number(limit) : undefined);
  }
}
