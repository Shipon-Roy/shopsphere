"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, ImageIcon, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { MAX_PRODUCT_IMAGES, MAX_IMAGE_SIZE_LABEL, ALLOWED_IMAGE_TYPES_LABEL } from "@/constants";

interface ImageInfo {
  index: number;
  url: string; // base64 data URL (from API) or blob URL (pending)
  isExisting: boolean;
}

interface ImageUploaderProps {
  productId: string;
  existingImages: Array<{ url: string | null; contentType: string; originalName: string; size: number }>;
  onUploadComplete?: () => void;
}

export function ImageUploader({ productId, existingImages, onUploadComplete }: ImageUploaderProps) {
  const [images, setImages] = useState<ImageInfo[]>(() =>
    existingImages
      .map((img, i) => ({ index: i, url: img.url ?? "", isExisting: true }))
      .filter((img) => img.url)
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAddMore = images.length < MAX_PRODUCT_IMAGES;

  // Fetch fresh base64 images from the admin product API after any mutation
  const refreshImages = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/products/${productId}`);
      if (!res.ok) return;
      const json = await res.json();
      const imgs: Array<{ url: string | null; contentType: string; originalName: string; size: number }> =
        json.data?.images ?? [];
      setImages(
        imgs
          .map((img, i) => ({ index: i, url: img.url ?? "", isExisting: true }))
          .filter((img) => img.url)
      );
    } catch {
      // silently ignore
    }
  }, [productId]);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const remaining = MAX_PRODUCT_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`Maximum ${MAX_PRODUCT_IMAGES} images already reached`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      fileArray.slice(0, remaining).forEach((f) => formData.append("images", f));

      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.message ?? "Upload failed");
        return;
      }
      if (json.data?.errors?.length) {
        toast.warning(`Uploaded with warnings: ${json.data.errors.join(", ")}`);
      } else {
        toast.success(json.message ?? "Images uploaded");
      }

      await refreshImages();
      onUploadComplete?.();
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [images.length, productId, refreshImages, onUploadComplete]);

  const handleDelete = async (index: number) => {
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/images?index=${index}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok) { toast.error(json.message ?? "Delete failed"); return; }
      toast.success("Image removed");
      await refreshImages();
      onUploadComplete?.();
    } catch {
      toast.error("Failed to delete image");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) uploadFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((img) => (
            <div
              key={`${img.index}-${img.url.slice(0, 30)}`}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              <img
                src={img.url}
                alt={`Product image ${img.index + 1}`}
                className="w-full h-full object-contain p-1"
              />
              {img.index === 0 && (
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  Primary
                </span>
              )}
              <button
                type="button"
                onClick={() => handleDelete(img.index)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow-md"
                aria-label={`Remove image ${img.index + 1}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload dropzone */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer",
            dragOver ? "border-primary bg-primary/5" : "border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5"
          )}
          role="button"
          aria-label="Upload images"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm font-medium text-gray-700">Uploading…</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {ALLOWED_IMAGE_TYPES_LABEL} · Max {MAX_IMAGE_SIZE_LABEL}
                </p>
              </div>
              <p className="text-xs text-gray-400">{images.length}/{MAX_PRODUCT_IMAGES} images</p>
            </>
          )}
        </div>
      )}

      {/* Limit reached */}
      {!canAddMore && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Maximum {MAX_PRODUCT_IMAGES} images reached. Delete one to add more.
        </div>
      )}

      {/* Empty */}
      {images.length === 0 && canAddMore && (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-1">
          <ImageIcon className="h-4 w-4" />
          No images yet — click the upload area above
        </div>
      )}
    </div>
  );
}
