import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthService,
    private readonly prisma: PrismaService
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness probe — does not touch the database' })
  liveness() {
    return this.health.liveness();
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe — verifies database and storage' })
  async readiness() {
    return this.health.readiness();
  }
}
