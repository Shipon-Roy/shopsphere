// ─────────────────────────────────────────────────────────────────────────────
// Image Utilities
// ─────────────────────────────────────────────────────────────────────────────

import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_LABEL,
  ALLOWED_IMAGE_TYPES_LABEL,
} from "@/constants";

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate image file type and size on the client side
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES_LABEL}`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size too large. Maximum allowed size is ${MAX_IMAGE_SIZE_LABEL}`,
    };
  }

  return { valid: true };
}

/**
 * Convert a File to a base64 data URL for preview
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Build the src URL for an image served from our API
 * e.g. /api/products/{id}/image?index=0
 */
export function getProductImageUrl(productId: string, index = 0): string {
  return `/api/products/${productId}/image?index=${index}`;
}

export function getCategoryImageUrl(categoryId: string): string {
  return `/api/categories/${categoryId}/image`;
}

export function getBrandImageUrl(brandId: string): string {
  return `/api/brands/${brandId}/image`;
}

export function getBannerImageUrl(bannerId: string): string {
  return `/api/banners/${bannerId}/image`;
}

export function getUserAvatarUrl(userId: string): string {
  return `/api/users/${userId}/avatar`;
}

export function getSettingsLogoUrl(): string {
  return `/api/admin/settings/logo`;
}

export function getSettingsFaviconUrl(): string {
  return `/api/admin/settings/favicon`;
}

/**
 * Convert an ArrayBuffer to a Buffer-compatible object for MongoDB storage
 * Used in API route handlers after reading multipart form data
 */
export async function fileToBuffer(file: File): Promise<{
  data: Buffer;
  contentType: string;
  originalName: string;
  size: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  return {
    data: Buffer.from(arrayBuffer),
    contentType: file.type,
    originalName: file.name,
    size: file.size,
  };
}
