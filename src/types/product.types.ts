// ─────────────────────────────────────────────────────────────────────────────
// Product & Related Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IBrand {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  contentType: string;
  originalName: string;
  size: number;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku: string;
  category: ICategory | string;
  brand?: IBrand | string | null;
  images: ProductImage[];
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  ratings: {
    average: number;
    count: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IReview {
  _id: string;
  user: {
    _id: string;
    name: string;
  };
  product: string;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "hidden";
  createdAt: string;
  updatedAt: string;
}

export interface IBanner {
  _id: string;
  title: string;
  subtitle?: string;
  link?: string;
  buttonText?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export function getStockStatus(stock: number): StockStatus {
  if (stock === 0) return "out_of_stock";
  if (stock <= 10) return "low_stock";
  return "in_stock";
}
