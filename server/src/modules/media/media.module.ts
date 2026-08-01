import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { storageConfig } from '@/config/configuration';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { STORAGE_PROVIDER } from './storage/storage.provider';

@Module({
  imports: [
    ConfigModule.forFeature(storageConfig),
    MulterModule.register({
      // Buffered in memory so content can be validated before it is written.
      storage: memoryStorage(),
      limits: { fileSize: Number(process.env.UPLOAD_MAX_BYTES ?? 10 * 1024 * 1024), files: 1 },
    }),
  ],
  controllers: [MediaController],
  providers: [
    MediaService,
    // Bound by token: swapping to S3 or R2 later means one new provider class
    // and one changed line here, with no service touched.
    { provide: STORAGE_PROVIDER, useClass: LocalStorageProvider },
  ],
  exports: [MediaService],
})
export class MediaModule {}
