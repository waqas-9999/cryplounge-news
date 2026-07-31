import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator';
import { HealthService } from './health.service';

/**
 * Version-neutral so the probes stay at /health and /health/ready.
 *
 * Monitoring and load balancers are configured once and must not have to
 * follow API version bumps.
 */
@ApiTags('Health')
@Controller({ path: 'health', version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly health: HealthService) {}

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
