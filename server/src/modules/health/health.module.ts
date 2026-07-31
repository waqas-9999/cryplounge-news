import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, storageConfig } from '@/config/configuration';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [ConfigModule.forFeature(appConfig), ConfigModule.forFeature(storageConfig)],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
