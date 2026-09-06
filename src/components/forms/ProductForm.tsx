"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { IProduct, ICategory, IBrand } from "@/types";
import {
  MAX_PRODUCT_IMAGES,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_IMAGE_TYPES_LABEL,
  MAX_IMAGE_SIZE_LABEL,
} from "@/constants";

// ── inline image preview for files not yet uploaded ──────────────────────────
interface PendingImage {
  file: File;
  previewUrl: string; // blob URL
}

// ── image already stored in DB ────────────────────────────────────────────────
interface StoredImage {
  index: number;
  src: string; // base64 data URL from API
}

// ── schema ────────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be positive"),
  comparePrice: z.coerce.number().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  tags: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
});
type FormData = z.infer<typeof schema>;

interface ProductFormProps {
  product?: IProduct;
  mode: "create" | "edit";
}

// ── component ─────────────────────────────────────────────────────────────────
export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [brands, setBrands] = useState<IBrand[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Pending images (selected but not yet uploaded — for create mode)
  const [pending, setPending] = useState<PendingImage[]>([]);

  // Stored images (already in DB — for edit mode)
  // product.images comes from the admin API which returns base64 data URLs
  const [stored, setStored] = useState<StoredImage[]>(() => {
    if (!product?.images?.length) return [];
    return (product.images as unknown as Array<{ url?: string }>)
      .map((img, i) => ({ index: i, src: img.url ?? "" }))
      .filter((img) => img.src);
  });

  const totalImages = stored.length + pending.length;
  const canAdd = totalImages < MAX_PRODUCT_IMAGES;

  const {
    register, handleSubmit, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      comparePrice: product?.comparePrice ?? undefined,
      stock: product?.stock ?? 0,
      sku: product?.sku ?? "",
      category: typeof product?.category === "object" ? product.category._id : (product?.category as string) ?? "",
      brand: typeof product?.brand === "object" ? product.brand?._id : (product?.brand as string) ?? "",
      tags: product?.tags?.join(", ") ?? "",
      isActive: product?.isActive ?? true,
      isFeatured: product?.isFeatured ?? false,
    },
  });

  useEffect(() => {
    fetch("/api/categories?limit=100").then(r => r.json()).then(j => setCategories(j.data ?? []));
    fetch("/api/brands?limit=100").then(r => r.json()).then(j => setBrands(j.data ?? []));
  }, []);

  // Revoke blob URLs when component unmounts
  useEffect(() => {
    return () => { pending.forEach(p => URL.revokeObjectURL(p.previewUrl)); };
  }, []); // eslint-disable-line

  // ── image selection ──────────────────────────────────────────────────────
  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files);
    const remaining = MAX_PRODUCT_IMAGES - totalImages;
    if (remaining <= 0) { toast.error(`Maximum ${MAX_PRODUCT_IMAGES} images allowed`); return; }

    const valid: PendingImage[] = [];
    for (const f of arr.slice(0, remaining)) {
      if (!ALLOWED_IMAGE_TYPES.includes(f.type as typeof ALLOWED_IMAGE_TYPES[number])) {
        toast.error(`${f.name}: unsupported type`); continue;
      }
      if (f.size > MAX_IMAGE_SIZE_BYTES) {
        toast.error(`${f.name}: exceeds ${MAX_IMAGE_SIZE_LABEL}`); continue;
      }
      valid.push({ file: f, previewUrl: URL.createObjectURL(f) });
    }
    setPending(prev => [...prev, ...valid]);
  }, [totalImages]);

  const removePending = (idx: number) => {
    setPending(prev => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const removeStored = async (idx: number) => {
    if (!product?._id) return;
    try {
      const res = await fetch(
        `/api/admin/products/${product._id}/images?index=${idx}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (!res.ok) { toast.error(json.message ?? "Delete failed"); return; }
      toast.success("Image removed");
      // Re-fetch product to get fresh base64 URLs
      const pRes = await fetch(`/api/admin/products/${product._id}`);
      if (pRes.ok) {
        const pJson = await pRes.json();
        const imgs: Array<{ url?: string }> = pJson.data?.images ?? [];
        setStored(imgs.map((img, i) => ({ index: i, src: img.url ?? "" })).filter(img => img.src));
      }
    } catch { toast.error("Failed to delete image"); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  // ── upload helper (used after product is created/exists) ─────────────────
  const uploadPending = async (productId: string): Promise<number> => {
    if (pending.length === 0) return stored.length;
    setUploading(true);
    try {
      const fd = new FormData();
      pending.forEach(p => fd.append("images", p.file));
      const res = await fetch(`/api/admin/products/${productId}/images`, { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) { toast.error(json.message ?? "Image upload failed"); }
      else if (json.data.errors?.length) toast.warning(`Some images had issues: ${json.data.errors.join(", ")}`);
      pending.forEach(p => URL.revokeObjectURL(p.previewUrl));
      setPending([]);
      return json.data?.imageCount ?? stored.length;
    } finally {
      setUploading(false);
    }
  };

  // ── form submit ───────────────────────────────────────────────────────────
  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      comparePrice: data.comparePrice || undefined,
      brand: data.brand || undefined,
    };

    const url = mode === "edit" ? `/api/admin/products/${product?._id}` : "/api/admin/products";
    const method = mode === "edit" ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { toast.error(json.message ?? "Failed to save product"); return; }

      const pid: string = json.data._id;

      // Upload any pending images
      await uploadPending(pid);

      toast.success(mode === "edit" ? "Product updated!" : "Product created!");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  };

  const isActive = watch("isActive");
  const isFeatured = watch("isFeatured");
  const field = (id: keyof FormData) => ({ className: cn(errors[id] && "border-destructive") });

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 max-w-3xl">

      {/* ── Image panel ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product Images</CardTitle>
          <CardDescription>
            Up to {MAX_PRODUCT_IMAGES} images. First image = primary listing photo.
            {" "}{ALLOWED_IMAGE_TYPES_LABEL} · Max {MAX_IMAGE_SIZE_LABEL} each.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">

          {/* Grid of stored + pending previews */}
          {(stored.length > 0 || pending.length > 0) && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {/* Stored (DB) images */}
              {stored.map((img) => (
                <div key={`stored-${img.index}`}
                  className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <img
                    src={img.src}
                    alt={`Product image ${img.index + 1}`}
                    className="w-full h-full object-contain p-1"
                  />
                  {img.index === 0 && (
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeStored(img.index)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}

              {/* Pending (local preview) images */}
              {pending.map((p, idx) => (
                <div key={`pending-${idx}`}
                  className="relative group aspect-square rounded-lg overflow-hidden border-2 border-dashed border-primary/40 bg-primary/5">
                  <img
                    src={p.previewUrl}
                    alt={p.file.name}
                    className="w-full h-full object-contain p-1"
                  />
                  {/* "Not saved yet" indicator */}
                  <span className="absolute bottom-1 left-1 bg-primary/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Pending
                  </span>
                  <button
                    type="button"
                    onClick={() => removePending(idx)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600 hover:bg-red-700 text-white rounded-full p-0.5 shadow"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {stored.length === 0 && pending.length === 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-1">
              <ImageIcon className="h-4 w-4" />
              No images selected yet
            </div>
          )}

          {/* Drop zone */}
          {canAdd && (
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={cn(
                "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
                dragOver ? "border-primary bg-primary/5" : "border-gray-300 bg-gray-50 hover:border-primary hover:bg-primary/5"
              )}
              role="button"
              aria-label="Add images"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={e => e.target.files && addFiles(e.target.files)}
              />
              {uploading ? (
                <>
                  <Loader2 className="h-7 w-7 text-primary animate-spin" />
                  <p className="text-sm text-gray-600">Uploading images…</p>
                </>
              ) : (
                <>
                  <Upload className="h-7 w-7 text-gray-400" />
                  <p className="text-sm font-medium text-gray-700">
                    Click to select or drag & drop
                  </p>
                  <p className="text-xs text-gray-400">
                    {totalImages}/{MAX_PRODUCT_IMAGES} images · {ALLOWED_IMAGE_TYPES_LABEL}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Max reached */}
          {!canAdd && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
              Maximum {MAX_PRODUCT_IMAGES} images reached. Remove one to add more.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Basic Info ── */}
      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Product Name *</Label>
            <Input id="name" {...register("name")} {...field("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" rows={4} {...register("description")}
              className={cn(errors.description && "border-destructive")} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="category">Category *</Label>
              <Select
                defaultValue={typeof product?.category === "object" ? product.category._id : ""}
                onValueChange={v => setValue("category", v)}
              >
                <SelectTrigger className={cn(errors.category && "border-destructive")}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Select
                defaultValue={typeof product?.brand === "object" ? product.brand?._id ?? "" : ""}
                onValueChange={v => setValue("brand", v === "__none__" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select brand (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No brand</SelectItem>
                  {brands.map(b => <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Pricing & Inventory ── */}
      <Card>
        <CardHeader><CardTitle>Pricing &amp; Inventory</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price ($) *</Label>
              <Input id="price" type="number" step="0.01" min="0" {...register("price")} {...field("price")} />
              {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comparePrice">Compare Price ($)</Label>
              <Input id="comparePrice" type="number" step="0.01" min="0"
                placeholder="Original price for discount" {...register("comparePrice")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="stock">Stock *</Label>
              <Input id="stock" type="number" min="0" {...register("stock")} {...field("stock")} />
              {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU *</Label>
              <Input id="sku" {...register("sku")} {...field("sku")} />
              {errors.sku && <p className="text-xs text-destructive">{errors.sku.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Tags & Visibility ── */}
      <Card>
        <CardHeader><CardTitle>Tags &amp; Visibility</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" placeholder="wireless, bluetooth, audio (comma separated)" {...register("tags")} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Active</p>
              <p className="text-xs text-muted-foreground">Visible to customers in the store</p>
            </div>
            <Switch checked={isActive} onCheckedChange={v => setValue("isActive", v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Featured</p>
              <p className="text-xs text-muted-foreground">Show in featured sections</p>
            </div>
            <Switch checked={isFeatured} onCheckedChange={v => setValue("isFeatured", v)} />
          </div>
        </CardContent>
      </Card>

      {/* ── Actions ── */}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={isSubmitting || uploading}>
          {isSubmitting || uploading
            ? uploading ? "Uploading images…" : "Saving…"
            : mode === "edit" ? "Save Changes" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
