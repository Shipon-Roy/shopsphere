import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IProductDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku: string;
  category: mongoose.Types.ObjectId;
  brand?: mongoose.Types.ObjectId | null;
  images: Array<{ data: Buffer; contentType: string; originalName: string; size: number }>;
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  ratings: { average: number; count: number };
  createdAt: Date;
  updatedAt: Date;
}

function toSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

const productSchema = new Schema<IProductDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, unique: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", default: null },
    images: [{ data: Buffer, contentType: String, originalName: String, size: Number }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [{ type: String, lowercase: true, trim: true }],
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true }
);

productSchema.set("toJSON", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(_doc: unknown, ret: any) {
    ret._id = String(ret._id);
    if (ret.category?._id) ret.category._id = String(ret.category._id);
    if (ret.brand?._id) ret.brand._id = String(ret.brand._id);
    // Strip binary image data — serve via dedicated image endpoint
    if (Array.isArray(ret.images)) {
      ret.images = ret.images.map((img: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        contentType: img.contentType,
        originalName: img.originalName,
        size: img.size,
      }));
    }
    delete ret.__v; // eslint-disable-line @typescript-eslint/no-dynamic-delete
    return ret;
  },
});

productSchema.index({ category: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ price: 1 });

productSchema.pre("validate", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = toSlug(this.name) + "-" + Date.now().toString(36);
  }
  next();
});

export const ProductModel: Model<IProductDocument> =
  (mongoose.models.Product as Model<IProductDocument>) ||
  mongoose.model<IProductDocument>("Product", productSchema);
