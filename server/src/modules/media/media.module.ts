import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { storageConfig } from '@/config/configuration';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { LocalStorageProvider } from './storage/local-storage.provider';
import { CloudinaryStorageProvider } from './storage/cloudinary-storage.provider';
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
    // Both providers are always constructed (cheap — neither does I/O in its
    // constructor); `storage.provider` decides, at runtime, which one is
    // actually bound to the token MediaService injects. Adding a third
    // (e.g. S3) means one more provider class and one more branch here, with
    // no change to MediaService or the controller.
    LocalStorageProvider,
    CloudinaryStorageProvider,
    {
      provide: STORAGE_PROVIDER,
      inject: [storageConfig.KEY, LocalStorageProvider, CloudinaryStorageProvider],
      useFactory: (
        config: ConfigType<typeof storageConfig>,
        local: LocalStorageProvider,
        cloudinary: CloudinaryStorageProvider
      ) => (config.provider === 'cloudinary' ? cloudinary : local),
    },
  ],
  exports: [MediaService],
})
export class MediaModule {}
