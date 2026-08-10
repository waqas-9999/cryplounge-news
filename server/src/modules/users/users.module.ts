import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    // AuthModule supplies AuthService for password hashing and session
    // revocation; MediaModule supplies MediaService for the self-avatar
    // upload. MulterModule is re-registered here (mirroring MediaModule)
    // because its config doesn't propagate through a plain module import —
    // FileInterceptor in this controller needs its own memory-storage setup.
    AuthModule,
    MediaModule,
    MulterModule.register({
      storage: memoryStorage(),
      limits: { fileSize: Number(process.env.UPLOAD_MAX_BYTES ?? 10 * 1024 * 1024), files: 1 },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
