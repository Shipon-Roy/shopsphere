// ─────────────────────────────────────────────────────────────────────────────
// App-wide Constants
// ─────────────────────────────────────────────────────────────────────────────

// App
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "ShopSphere";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const APP_DESCRIPTION =
  "ShopSphere — Your one-stop modern e-commerce platform.";

// Auth
export const COOKIE_NAME = process.env.COOKIE_NAME ?? "shopsphere_token";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds
export const JWT_EXPIRES_IN = "7d";

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const ADMIN_TABLE_LIMIT = 10;

// Image upload constraints
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_IMAGE_SIZE_LABEL = "5MB";
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
export const ALLOWED_IMAGE_TYPES_LABEL = "JPEG, JPG, PNG, WebP, GIF";

// Product
export const LOW_STOCK_THRESHOLD = 10;
export const MAX_PRODUCT_IMAGES = 5;

// Order status labels & colors
export const ORDER_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "warning",
    description: "Order placed, awaiting confirmation",
  },
  processing: {
    label: "Processing",
    color: "info",
    description: "Order confirmed and being prepared",
  },
  shipped: {
    label: "Shipped",
    color: "primary",
    description: "Order has been shipped",
  },
  delivered: {
    label: "Delivered",
    color: "success",
    description: "Order successfully delivered",
  },
  cancelled: {
    label: "Cancelled",
    color: "destructive",
    description: "Order has been cancelled",
  },
} as const;

// Payment status config
export const PAYMENT_STATUS_CONFIG = {
  pending: { label: "Pending", color: "warning" },
  paid: { label: "Paid", color: "success" },
  failed: { label: "Failed", color: "destructive" },
  refunded: { label: "Refunded", color: "info" },
} as const;

// Payment methods
export const PAYMENT_METHOD_CONFIG = {
  cod: { label: "Cash on Delivery" },
  card: { label: "Credit / Debit Card" },
  bank_transfer: { label: "Bank Transfer" },
} as const;

// Review status
export const REVIEW_STATUS_CONFIG = {
  pending: { label: "Pending Review", color: "warning" },
  approved: { label: "Approved", color: "success" },
  hidden: { label: "Hidden", color: "muted" },
} as const;

// User roles
export const USER_ROLE_CONFIG = {
  user: { label: "User", color: "secondary" },
  admin: { label: "Admin", color: "primary" },
} as const;

// Sorting options for product listing
export const PRODUCT_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest First" },
  { value: "createdAt:asc", label: "Oldest First" },
  { value: "price:asc", label: "Price: Low to High" },
  { value: "price:desc", label: "Price: High to Low" },
  { value: "name:asc", label: "Name: A to Z" },
  { value: "name:desc", label: "Name: Z to A" },
  { value: "ratings.average:desc", label: "Top Rated" },
] as const;

// Tax rate (percentage)
export const TAX_RATE = 0.05; // 5%

// Shipping
export const FREE_SHIPPING_THRESHOLD = 100; // Free shipping above $100
export const SHIPPING_FEE = 10; // Flat shipping fee

// Admin sidebar nav items
export const ADMIN_NAV_ITEMS = [
  {
    title: "Overview",
    href: "/admin",
    icon: "LayoutDashboard",
    exact: true,
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: "Package",
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: "Tag",
  },
  {
    title: "Brands",
    href: "/admin/brands",
    icon: "Building2",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: "ShoppingCart",
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: "Users",
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: "Star",
  },
  {
    title: "Banners",
    href: "/admin/banners",
    icon: "Image",
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: "Settings",
  },
] as const;

// User sidebar nav items
export const USER_NAV_ITEMS = [
  { title: "My Profile", href: "/user/profile", icon: "User" },
  { title: "My Orders", href: "/user/orders", icon: "ShoppingBag" },
  { title: "My Cart", href: "/user/cart", icon: "ShoppingCart" },
] as const;

// Countries list (abbreviated)
export const COUNTRIES = [
  "Bangladesh",
  "India",
  "Pakistan",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "UAE",
  "Saudi Arabia",
  "Singapore",
  "Malaysia",
] as const;
