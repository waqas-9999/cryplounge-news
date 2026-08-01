/**
 * Storage abstraction.
 *
 * The brief mandates local disk for v1 but requires that cloud storage can be
 * added later without touching business logic. MediaService therefore depends
 * on this interface and never on `fs`: swapping to S3 or R2 means writing one
 * new provider and changing the binding in MediaModule.
 */
export interface StoredFile {
  /** Identifier persisted on the Media row. Opaque to callers. */
  path: string;
  size: number;
}

export interface StorageProvider {
  /**
   * Persist a file and return its identifier.
   *
   * @param folder logical folder, e.g. "/articles". Never a filesystem path.
   */
  save(params: {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    folder: string;
  }): Promise<StoredFile>;

  delete(path: string): Promise<void>;

  /** Public URL for a stored file. */
  url(path: string): string;

  exists(path: string): Promise<boolean>;
}

/** Injection token — providers are bound by this, never by class. */
export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
