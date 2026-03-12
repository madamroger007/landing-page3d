import sharp from 'sharp';

// ─── Compression Configuration ───────────────────────────────────────────────

const MAX_WIDTH = 1200;
const WEBP_QUALITY = 80;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CompressedImage {
    buffer: Buffer;
    width: number;
    height: number;
    format: string;
}

// ─── Compression Functions ───────────────────────────────────────────────────

/**
 * Compress and optimize an image buffer
 * - Resizes to max width of 1200px (maintains aspect ratio)
 * - Converts to WebP format
 * - Applies 80% quality compression
 *
 * @param inputBuffer - The original image buffer
 * @returns Promise with compressed buffer and metadata
 */
export async function compressImage(inputBuffer: Buffer): Promise<CompressedImage> {
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();

    // Calculate new dimensions if needed
    let width = metadata.width || MAX_WIDTH;
    let height = metadata.height || MAX_WIDTH;

    if (width > MAX_WIDTH) {
        const ratio = MAX_WIDTH / width;
        width = MAX_WIDTH;
        height = Math.round(height * ratio);
    }

    // Compress and convert to WebP
    const compressedBuffer = await image
        .resize(width, height, {
            fit: 'inside',
            withoutEnlargement: true,
        })
        .webp({
            quality: WEBP_QUALITY,
        })
        .toBuffer();

    return {
        buffer: compressedBuffer,
        width,
        height,
        format: 'webp',
    };
}

/**
 * Get image metadata without processing
 * @param buffer - The image buffer
 * @returns Image metadata (width, height, format)
 */
export async function getImageMetadata(buffer: Buffer) {
    const metadata = await sharp(buffer).metadata();
    return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
    };
}
