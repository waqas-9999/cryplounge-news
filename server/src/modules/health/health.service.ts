import { access, constants } from 'node:fs/promises';
import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { appConfig, storageConfig } from '@/config/configuration';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Health reporting for monitoring tools.
 *
 * Liveness answers "is the process up"; readiness answers "can it actually
 * serve traffic". A load balancer should route on readiness, which is why a
 * failed dependency returns 503 rather than a 200 with a sad payload.
 */
@Injectable()
export class HealthService {
  private readonly startedAt = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    @Inject(appConfig.KEY) private readonly app: ConfigType<typeof appConfig>,
    @Inject(storageConfig.KEY) private readonly storage: ConfigType<typeof storageConfig>
  ) {}

  liveness() {
    return {
      status: 'ok',
      version: process.env.npm_package_version ?? '1.0.0',
      environment: this.app.env,
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
    };
  }

  async readiness() {
    const [database, uploads] = await Promise.all([this.prisma.ping(), this.checkUploadDir()]);

    const checks = { database, storage: uploads };
    const healthy = Object.values(checks).every(Boolean);

    if (!healthy) {
      throw new ServiceUnavailableException({
        message: 'Service is not ready',
        code: 'NOT_READY',
        errors: Object.entries(checks)
          .filter(([, ok]) => !ok)
          .reduce<Record<string, string[]>>((acc, [key]) => {
            acc[key] = ['unavailable'];
            return acc;
          }, {}),
      });
    }

    return { status: 'ready', checks, uptimeSeconds: this.liveness().uptimeSeconds };
  }

  /** The upload directory must exist and be writable, or media uploads fail. */
  private async checkUploadDir(): Promise<boolean> {
    try {
      await access(this.storage.uploadDir, constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }
}
