import { readImageDimensions } from './image-dimensions';

/**
 * Reading dimensions from a file header.
 *
 * Built from real byte layouts rather than fixtures on disk, so each test
 * states the structure it depends on. The negative cases matter as much as the
 * positive ones: a wrong dimension is persisted as though it were a fact about
 * the image, whereas a null is handled by the renderer.
 */

function png(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(24);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buffer, 0);
  buffer.write('IHDR', 12, 'ascii');
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

describe('PNG', () => {
  it('reads the IHDR chunk', () => {
    expect(readImageDimensions(png(960, 540))).toEqual({ width: 960, height: 540 });
  });

  it('rejects a signature without IHDR where it belongs', () => {
    const broken = png(960, 540);
    broken.write('XXXX', 12, 'ascii');
    expect(readImageDimensions(broken)).toBeNull();
  });
});

describe('JPEG', () => {
  it('walks past metadata to the frame header', () => {
    // The reason this format needs a scan: dimensions sit after a variable
    // number of segments, not at a fixed offset.
    const buffer = Buffer.alloc(40, 0);
    buffer[0] = 0xff;
    buffer[1] = 0xd8;
    // An APP0 segment of length 10 to skip over.
    buffer[2] = 0xff;
    buffer[3] = 0xe0;
    buffer.writeUInt16BE(10, 4);
    // Then SOF0.
    buffer[14] = 0xff;
    buffer[15] = 0xc0;
    buffer.writeUInt16BE(17, 16);
    buffer.writeUInt16BE(480, 19); // height
    buffer.writeUInt16BE(640, 21); // width

    expect(readImageDimensions(buffer)).toEqual({ width: 640, height: 480 });
  });
});

describe('GIF and WebP', () => {
  it('reads a GIF screen descriptor', () => {
    const buffer = Buffer.alloc(24, 0);
    buffer.write('GIF89a', 0, 'ascii');
    buffer.writeUInt16LE(300, 6);
    buffer.writeUInt16LE(200, 8);

    expect(readImageDimensions(buffer)).toEqual({ width: 300, height: 200 });
  });

  it('reads a lossy WebP', () => {
    const buffer = Buffer.alloc(32, 0);
    buffer.write('RIFF', 0, 'ascii');
    buffer.write('WEBP', 8, 'ascii');
    buffer.write('VP8 ', 12, 'ascii');
    buffer.writeUInt16LE(1200, 26);
    buffer.writeUInt16LE(630, 28);

    expect(readImageDimensions(buffer)).toEqual({ width: 1200, height: 630 });
  });
});

describe('refusing to guess', () => {
  it('returns null for an unrecognised format', () => {
    expect(readImageDimensions(Buffer.alloc(64, 7))).toBeNull();
  });

  it('returns null for a truncated file', () => {
    expect(readImageDimensions(Buffer.alloc(8))).toBeNull();
  });

  it('returns null for SVG, which has no reliable pixel size', () => {
    const svg = Buffer.from('<svg viewBox="0 0 10 10"></svg>');
    expect(readImageDimensions(svg, 'image/svg+xml')).toBeNull();
  });

  it('rejects zero and absurd dimensions from a malformed header', () => {
    expect(readImageDimensions(png(0, 100))).toBeNull();
    expect(readImageDimensions(png(500_000, 100))).toBeNull();
  });

  it('ignores a mime type that disagrees with the bytes', () => {
    // The declared type is caller-supplied; the magic bytes are not.
    expect(readImageDimensions(png(800, 600), 'image/jpeg')).toEqual({ width: 800, height: 600 });
  });
});
