// ─────────────────────────────────────────────────────────────────────────────
// Order & Cart Types
// ─────────────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type PaymentMethod = "cod" | "card" | "bank_transfer";

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  imageContentType?: string;
}

export interface IOrder {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Cart types
export interface CartItem {
  product: {
    _id: string;
    name: string;
    price: number;
    stock: number;
    slug: string;
    images: Array<{ contentType: string }>;
  };
  quantity: number;
  price: number;
}

export interface ICart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// Derived cart totals (computed on client)
export interface CartTotals {
  subtotal: number;
  shippingFee: number;
  tax: number;
  total: number;
  itemCount: number;
}
