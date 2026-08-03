import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ICategoryDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toSlug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.set("toJSON", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(_doc: unknown, ret: any) {
    ret._id = String(ret._id);
    delete ret.__v; // eslint-disable-line @typescript-eslint/no-dynamic-delete
    return ret;
  },
});

categorySchema.pre("validate", function (next) {
  if (this.isModified("name") && !this.slug) {
    this.slug = toSlug(this.name);
  }
  next();
});

export const CategoryModel: Model<ICategoryDocument> =
  (mongoose.models.Category as Model<ICategoryDocument>) ||
  mongoose.model<ICategoryDocument>("Category", categorySchema);
