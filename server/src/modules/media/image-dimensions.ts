/**
 * Image dimensions, read from the file's own header.
 *
 * ## Why not a decoding library
 *
 * `sharp` would answer this in one call, but it is a ~30MB native binary and
 * the API does not otherwise decode images — it stores them. Pulling it in for
 * two integers would add a compiled dependency, a platform-specific install
 * step and a new failure mode at boot, all to read bytes that every one of
 * these formats puts near the front of the file on purpose.
 *
 * ## Why not trust the uploader
 *
 * Dimensions could be sent alongside the file. They are not read from the
 * request here, because a caller that is wrong — or lying — would have the
 * page reserve the wrong space, and the value is stored as though it were a
 * property of the image. The file is the only thing that actually knows.
 *
 * Returns null rather than guessing for anything unrecognised or truncated. A
 * null dimension is handled by the renderer; a wrong one is not.
 */

export interface ImageDimensions {
  width: number;
  height: number;
}

export function readImageDimensions(buffer: Buffer, mimeType?: string): ImageDimensions | null {
  if (buffer.length < 24) return null;

  // Dispatched on the file's magic bytes rather than the declared mime type,
  // which is caller-supplied and may not match the payload.
  if (isPng(buffer)) return png(buffer);
  if (isJpeg(buffer)) return jpeg(buffer);
  if (isGif(buffer)) return gif(buffer);
  if (isWebp(buffer)) return webp(buffer);

  // SVG has no binary header; the viewBox would need parsing and is often
  // absent or in units that are not pixels. Reported as unknown, honestly.
  if (mimeType === 'image/svg+xml') return null;

  return null;
}

/* ------------------------------------------------------------------- PNG -- */

function isPng(buffer: Buffer): boolean {
  return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
}

function png(buffer: Buffer): ImageDimensions | null {
  // IHDR is always the first chunk: 8 signature + 4 length + 4 type, then
  // width and height as big-endian 32-bit integers.
  if (buffer.length < 24 || buffer.toString('ascii', 12, 16) !== 'IHDR') return null;

  return valid(buffer.readUInt32BE(16), buffer.readUInt32BE(20));
}

/* ------------------------------------------------------------------ JPEG -- */

function isJpeg(buffer: Buffer): boolean {
  return buffer[0] === 0xff && buffer[1] === 0xd8;
}

/**
 * Walks the JPEG marker segments to the frame header.
 *
 * Unlike the other formats, JPEG has no fixed offset — the dimensions live in
 * a SOF marker that can sit after any number of metadata segments, and an
 * image with a large EXIF block puts it thousands of bytes in.
 */
function jpeg(buffer: Buffer): ImageDimensions | null {
  let offset = 2;

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1]!;

    // SOF0-SOF15, excluding the four that are not frame headers.
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return valid(buffer.readUInt16BE(offset + 7), buffer.readUInt16BE(offset + 5));
    }

    const length = buffer.readUInt16BE(offset + 2);
    if (length < 2) return null;
    offset += 2 + length;
  }

  return null;
}

/* ------------------------------------------------------------------- GIF -- */

function isGif(buffer: Buffer): boolean {
  return buffer.toString('ascii', 0, 3) === 'GIF';
}

function gif(buffer: Buffer): ImageDimensions | null {
  return valid(buffer.readUInt16LE(6), buffer.readUInt16LE(8));
}

/* ------------------------------------------------------------------ WebP -- */

function isWebp(buffer: Buffer): boolean {
  return buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
}

/**
 * WebP is three formats behind one header.
 *
 * `VP8 ` is lossy, `VP8L` lossless with bit-packed dimensions, and `VP8X` the
 * extended container. They store size differently and all three occur in
 * practice — the newsroom's banners are lossy, its charts arrive as PNG.
 */
function webp(buffer: Buffer): ImageDimensions | null {
  const format = buffer.toString('ascii', 12, 16);

  if (format === 'VP8 ' && buffer.length >= 30) {
    return valid(buffer.readUInt16LE(26) & 0x3fff, buffer.readUInt16LE(28) & 0x3fff);
  }

  if (format === 'VP8L' && buffer.length >= 25) {
    const bits = buffer.readUInt32LE(21);
    return valid((bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1);
  }

  if (format === 'VP8X' && buffer.length >= 30) {
    // 24-bit little-endian, stored as one less than the real value.
    const width = (buffer[24]! | (buffer[25]! << 8) | (buffer[26]! << 16)) + 1;
    const height = (buffer[27]! | (buffer[28]! << 8) | (buffer[29]! << 16)) + 1;
    return valid(width, height);
  }

  return null;
}

/** Rejects the zero and absurd values a malformed header can produce. */
function valid(width: number, height: number): ImageDimensions | null {
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  if (width <= 0 || height <= 0) return null;
  if (width > 100_000 || height > 100_000) return null;

  return { width, height };
}
