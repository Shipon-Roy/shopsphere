import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IBannerDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  subtitle?: string;
  link?: string;
  buttonText?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const bannerSchema = new Schema<IBannerDocument>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    subtitle: { type: String, trim: true, maxlength: 300 },
    link: { type: String, trim: true },
    buttonText: { type: String, trim: true, maxlength: 50 },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bannerSchema.set("toJSON", {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform(_doc: unknown, ret: any) {
    ret._id = String(ret._id);
    delete ret.__v; // eslint-disable-line @typescript-eslint/no-dynamic-delete
    return ret;
  },
});

bannerSchema.index({ isActive: 1, order: 1 });

export const BannerModel: Model<IBannerDocument> =
  (mongoose.models.Banner as Model<IBannerDocument>) ||
  mongoose.model<IBannerDocument>("Banner", bannerSchema);
