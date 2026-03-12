import { compressImage } from './image-compress';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicIdFromUrl } from './cloudinary';

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ImageUploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

// ─── Validation ──────────────────────────────────────────────────────────────

export function validateImageFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
        return 'Invalid file type. Use JPEG, PNG, or WebP.';
    }
    if (file.size > MAX_FILE_SIZE) {
        return 'File too large. Maximum 5MB.';
    }
    return null;
}

// ─── Upload Functions ────────────────────────────────────────────────────────

/**
 * Compress and upload an image to Cloudinary
 */
export async function processAndUploadImage(
    file: File,
    folder = 'products'
): Promise<ImageUploadResult> {
    const error = validateImageFile(file);
    if (error) {
        return { success: false, error };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const compressed = await compressImage(buffer);
        const result = await uploadToCloudinary(compressed.buffer, folder);

        return { success: true, url: result.url };
    } catch (err) {
        console.error('Image upload error:', err);
        return { success: false, error: 'Failed to upload image' };
    }
}

/**
 * Upload new image and delete old one from Cloudinary
 */
export async function replaceImage(
    newFile: File,
    oldUrl: string | null,
    folder = 'products'
): Promise<ImageUploadResult> {
    const uploadResult = await processAndUploadImage(newFile, folder);

    // Delete old image if upload succeeded
    if (uploadResult.success && oldUrl) {
        const publicId = extractPublicIdFromUrl(oldUrl);
        if (publicId) {
            await deleteFromCloudinary(publicId);
        }
    }

    return uploadResult;
}
