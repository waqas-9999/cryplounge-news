import { randomBytes } from 'node:crypto';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { storageConfig } from '@/config/configuration';
import type { StorageProvider, StoredFile } from './storage.provider';

/**
 * Cloudinary storage.
 *
 * `Media.path` stores the Cloudinary public ID (not a URL) — same role it
 * played for `LocalStorageProvider`: an opaque identifier the provider alone
 * knows how to turn into a URL or delete. `url()` builds the delivery URL
 * from the public ID via the SDK (no network call, no need to persist the
 * URL separately), so this needs no schema change.
 *
 * The file is validated (size, MIME, magic bytes) by `MediaService` before
 * this is ever called — this provider only moves already-trusted bytes.
 */
@Injectable()
export class CloudinaryStorageProvider implements StorageProvider {
  private readonly configured: boolean;

  constructor(@Inject(storageConfig.KEY) private readonly config: ConfigType<typeof storageConfig>) {
    const { cloudName, apiKey, apiSecret } = this.config.cloudinary;
    this.configured = Boolean(cloudName && apiKey && apiSecret);
    if (this.configured) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
    }
  }

  async save(params: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    folder: string;
  }): Promise<StoredFile> {
    this.assertConfigured();
    const publicId = `${this.safeFolder(params.folder)}/${randomBytes(16).toString('hex')}`;

    const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { public_id: publicId, resource_type: 'image', overwrite: false },
        (error, result) => {
          if (error || !result) reject(error ?? new Error('Cloudinary upload returned no result'));
          else resolve(result);
        }
      );
      stream.end(params.buffer);
    });

    return { path: uploaded.public_id, size: uploaded.bytes };
  }

  async delete(path: string): Promise<void> {
    this.assertConfigured();
    await cloudinary.uploader.destroy(path, { resource_type: 'image' });
  }

  url(path: string): string {
    this.assertConfigured();
    return cloudinary.url(path, { secure: true, resource_type: 'image' });
  }

  async exists(path: string): Promise<boolean> {
    this.assertConfigured();
    try {
      await cloudinary.api.resource(path, { resource_type: 'image' });
      return true;
    } catch {
      return false;
    }
  }

  /** Mirrors `LocalStorageProvider`'s folder restriction — never user-supplied paths. */
  private safeFolder(folder: string): string {
    const cleaned = folder.replace(/[^a-zA-Z0-9-_]/g, '');
    return cleaned || 'general';
  }

  private assertConfigured(): void {
    if (!this.configured) {
      throw new InternalServerErrorException({
        message: 'Cloudinary is not configured',
        code: 'STORAGE_NOT_CONFIGURED',
      });
    }
  }
}
