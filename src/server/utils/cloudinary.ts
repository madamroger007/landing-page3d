import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// ─── Cloudinary Configuration ────────────────────────────────────────────────

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
}

// ─── Upload Functions ────────────────────────────────────────────────────────

/**
 * Upload a buffer to Cloudinary
 * @param buffer - The image buffer to upload
 * @param folder - The folder to upload to (default: 'products')
 * @returns Promise with upload result containing URL and metadata
 */
export async function uploadToCloudinary(
    buffer: Buffer,
    folder: string = 'products'
): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                format: 'webp',
                transformation: [
                    { quality: 'auto:good' },
                ],
            },
            (error, result: UploadApiResponse | undefined) => {
                if (error) {
                    reject(new Error(`Cloudinary upload failed: ${error.message}`));
                    return;
                }

                if (!result) {
                    reject(new Error('Cloudinary upload returned no result'));
                    return;
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                    width: result.width,
                    height: result.height,
                    format: result.format,
                });
            }
        );

        uploadStream.end(buffer);
    });
}

/**
 * Delete an image from Cloudinary by public ID
 * @param publicId - The public ID of the image to delete
 * @returns Promise<boolean> - true if deletion was successful
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Failed to delete from Cloudinary:', error);
        return false;
    }
}

/**
 * Extract public ID from a Cloudinary URL
 * @param url - The Cloudinary URL
 * @returns The public ID or null if not a valid Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
    if (!url || !url.includes('cloudinary.com')) {
        return null;
    }

    try {
        // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
        const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/;
        const match = url.match(regex);
        return match ? match[1] : null;
    } catch {
        return null;
    }
}
