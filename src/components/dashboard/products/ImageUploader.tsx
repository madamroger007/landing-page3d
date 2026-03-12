'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ImageUploaderProps {
    /** Current image URL (from database/cloudinary) */
    value: string;
    /** Callback when a new file is selected */
    onFileChange: (file: File | null) => void;
    /** Callback when image is removed */
    onRemove?: () => void;
    /** Disable the uploader */
    disabled?: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * ImageUploader - Drag-and-drop image picker with local preview.
 * Does NOT upload directly. Passes File to parent for upload on form submit.
 */
export default function ImageUploader({
    value,
    onFileChange,
    onRemove,
    disabled = false,
}: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Cleanup preview URL on unmount
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    // ── File Validation ────────────────────────────────────────────────────

    const validateFile = useCallback((file: File): string | null => {
        if (!ALLOWED_TYPES.includes(file.type)) {
            return 'Invalid file type. Use JPEG, PNG, or WebP.';
        }
        if (file.size > MAX_FILE_SIZE) {
            return 'File too large. Maximum 5MB.';
        }
        return null;
    }, []);

    // ── File Selection ─────────────────────────────────────────────────────

    const handleSelect = useCallback(
        (file: File) => {
            const validationError = validateFile(file);
            if (validationError) {
                setError(validationError);
                return;
            }

            // Clear previous preview
            if (preview) URL.revokeObjectURL(preview);

            // Create local preview
            setPreview(URL.createObjectURL(file));
            setError(null);

            // Pass file to parent (upload happens on form submit)
            onFileChange(file);
        },
        [preview, onFileChange, validateFile]
    );

    // ── Event Handlers ─────────────────────────────────────────────────────

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleSelect(file);
            e.target.value = '';
        },
        [handleSelect]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (disabled) return;

            const file = e.dataTransfer.files[0];
            if (file) handleSelect(file);
        },
        [disabled, handleSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleRemove = useCallback(() => {
        if (preview) {
            URL.revokeObjectURL(preview);
            setPreview(null);
        }
        setError(null);
        onFileChange(null);
        onRemove?.();
    }, [preview, onFileChange, onRemove]);

    const handleClick = useCallback(() => {
        if (!disabled && inputRef.current) {
            inputRef.current.click();
        }
    }, [disabled]);

    // ── Render ─────────────────────────────────────────────────────────────

    const displayImage = preview || value;

    return (
        <div className="space-y-2">
            <input
                ref={inputRef}
                type="file"
                accept={ALLOWED_TYPES.join(',')}
                onChange={handleInputChange}
                disabled={disabled}
                className="hidden"
            />

            {/* Dropzone / Preview Area */}
            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                    relative border-2 border-dashed rounded-lg overflow-hidden cursor-pointer
                    transition-all duration-200 min-h-[200px]
                    ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    ${error ? 'border-red-500' : ''}
                `}
            >
                {displayImage ? (
                    <div className="relative w-full h-[200px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={displayImage}
                            alt="Preview"
                            className="w-full h-full object-contain bg-gray-800"
                        />

                        {/* Pending upload indicator */}
                        {preview && (
                            <span className="absolute top-2 left-2 px-2 py-1 bg-yellow-500/90 text-black text-xs font-medium rounded">
                                Pending upload
                            </span>
                        )}

                        {/* Remove Button */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                            disabled={disabled}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[200px] p-6 text-center">
                        <svg
                            className="h-12 w-12 text-gray-500 mb-3"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                        <p className="text-gray-400 text-sm mb-1">
                            <span className="text-blue-400 font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-gray-500 text-xs">
                            JPEG, PNG, WebP (max 5MB)
                        </p>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
