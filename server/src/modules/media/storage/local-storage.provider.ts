import { randomBytes } from 'node:crypto';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { storageConfig } from '@/config/configuration';
import type { StorageProvider, StoredFile } from './storage.provider';

/**
 * Local disk storage.
 *
 * Two things this file is careful about, because both are named in the brief:
 *
 * Path traversal — a stored path is *generated*, never taken from the upload.
 * The original filename only contributes a sanitised extension. Every path is
 * additionally re-resolved and checked to be inside the upload root before any
 * read or delete, so a crafted value in the database still cannot escape.
 *
 * Collisions — names are random, so two files called `logo.png` cannot
 * overwrite one another.
 */
@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly root: string;

  constructor(@Inject(storageConfig.KEY) private readonly config: ConfigType<typeof storageConfig>) {
    this.root = resolve(this.config.uploadDir);
  }

  async save(params: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    folder: string;
  }): Promise<StoredFile> {
    const folder = this.safeFolder(params.folder);
    const filename = `${randomBytes(16).toString('hex')}${this.safeExtension(params.originalName)}`;

    // Date-based sharding keeps directories small enough to list.
    const now = new Date();
    const shard = join(String(now.getUTCFullYear()), String(now.getUTCMonth() + 1).padStart(2, '0'));

    const relative = join(folder, shard, filename);
    const absolute = this.absolute(relative);

    await mkdir(resolve(absolute, '..'), { recursive: true });
    await writeFile(absolute, params.buffer);

    return {
      // Always forward slashes: the value is a URL component, not an OS path.
      path: relative.split(sep).join('/'),
      size: params.buffer.byteLength,
    };
  }

  async delete(path: string): Promise<void> {
    await rm(this.absolute(path), { force: true });
  }

  url(path: string): string {
    return `${this.config.publicUrl}/uploads/${path.replace(/^\/+/, '')}`;
  }

  async exists(path: string): Promise<boolean> {
    try {
      await stat(this.absolute(path));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Resolve a stored path against the upload root, refusing anything that
   * escapes it.
   */
  private absolute(relative: string): string {
    const candidate = resolve(this.root, normalize(relative).replace(/^([/\\])+/, ''));

    if (candidate !== this.root && !candidate.startsWith(this.root + sep)) {
      throw new InternalServerErrorException({
        message: 'Invalid storage path',
        code: 'INVALID_PATH',
      });
    }
    return candidate;
  }

  /** Folders are a flat, restricted vocabulary — never user-supplied paths. */
  private safeFolder(folder: string): string {
    const cleaned = folder.replace(/[^a-zA-Z0-9-_]/g, '');
    return cleaned || 'general';
  }

  /**
   * Extension taken from the original name, restricted to a known list.
   *
   * Anything unrecognised becomes `.bin`, so an upload cannot land as `.html`
   * or `.svg` and be served back as executable content.
   */
  private safeExtension(originalName: string): string {
    const allowed = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif']);
    const ext = extname(originalName).toLowerCase();
    return allowed.has(ext) ? ext : '.bin';
  }
}
