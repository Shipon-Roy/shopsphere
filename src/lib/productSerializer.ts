import type { IProductDocument } from "@/models/Product";

type ImageWithUrl = {
  url: string | null;
  contentType: string;
  originalName: string;
  size: number;
};

/**
 * Converts a Mongoose IProductDocument to a plain JSON-safe object,
 * transforming image Buffers into base64 data URLs so the frontend
 * can render them directly without a separate image API route.
 */
export function serializeProduct(p: IProductDocument): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj = p.toObject({ virtuals: false }) as any;

  obj._id = String(p._id);

  if (p.category && typeof p.category === "object" && "_id" in p.category) {
    obj.category._id = String((p.category as { _id: unknown })._id);
  }
  if (p.brand && typeof p.brand === "object" && "_id" in p.brand) {
    obj.brand._id = String((p.brand as { _id: unknown })._id);
  }

  obj.images = p.images.map((img): ImageWithUrl => ({
    url: img.data
      ? `data:${img.contentType};base64,${(img.data as Buffer).toString("base64")}`
      : null,
    contentType: img.contentType,
    originalName: img.originalName,
    size: img.size,
  }));

  delete obj.__v;
  return obj as Record<string, unknown>;
}
