/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ShopSphere — Database Seed Script
 *
 * Creates:
 *   • Admin user        (from ADMIN_SEED_EMAIL / ADMIN_SEED_PASSWORD)
 *   • Sample categories (6)
 *   • Sample brands     (4)
 *   • Sample products   (12)
 *   • Sample banner     (1)
 *
 * Usage:
 *   npm run seed
 *
 * Safe to re-run — existing documents are skipped (upsert by unique key).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// ── Load .env.local ───────────────────────────────────────────────────────────
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config(); // fallback to .env
}

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL ?? "admin@shopsphere.com";
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD ?? "Admin@123456";
const ADMIN_NAME = "Admin";

if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set in .env.local");
  process.exit(1);
}

// ── Inline schema definitions (avoids Next.js / module resolution issues) ────

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: { type: String, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isBlocked: { type: Boolean, default: false },
    blockedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const categorySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const brandSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true, lowercase: true },
    description: String,
    price: Number,
    comparePrice: Number,
    stock: { type: Number, default: 0 },
    sku: { type: String, unique: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", default: null },
    images: { type: Array, default: [] },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [String],
    ratings: { average: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
  },
  { timestamps: true }
);

const bannerSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    link: String,
    buttonText: String,
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Register models safely ────────────────────────────────────────────────────
const User = mongoose.models.User ?? mongoose.model("User", userSchema);
const Category = mongoose.models.Category ?? mongoose.model("Category", categorySchema);
const Brand = mongoose.models.Brand ?? mongoose.model("Brand", brandSchema);
const Product = mongoose.models.Product ?? mongoose.model("Product", productSchema);
const Banner = mongoose.models.Banner ?? mongoose.model("Banner", bannerSchema);

// ── Helpers ───────────────────────────────────────────────────────────────────
function slug(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

function sku(name: string, idx: number): string {
  return `SKU-${name.replace(/\s+/g, "").toUpperCase().slice(0, 5)}-${String(idx).padStart(3, "0")}`;
}

// ── Seed data ─────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Electronics", description: "Gadgets, devices, and accessories" },
  { name: "Clothing", description: "Fashion for all seasons" },
  { name: "Home & Garden", description: "Everything for your home" },
  { name: "Sports", description: "Sports and outdoor equipment" },
  { name: "Books", description: "Books for every reader" },
  { name: "Toys", description: "Fun for all ages" },
];

const BRANDS = [
  { name: "TechNova", description: "Leading electronics brand" },
  { name: "StyleCraft", description: "Premium fashion label" },
  { name: "HomeEase", description: "Quality home products" },
  { name: "ProSport", description: "Professional sports gear" },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("\n🌱  ShopSphere Seed Script\n");

  // Connect
  console.log("⏳  Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI as string);
  console.log("✅  Connected\n");

  // ── 1. Admin user ─────────────────────────────────────────────────────────
  console.log("👤  Seeding admin user…");
  const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
  if (existing) {
    if (existing.role !== "admin") {
      await User.updateOne({ _id: existing._id }, { role: "admin" });
      console.log(`   ↳ Existing user ${ADMIN_EMAIL} promoted to admin`);
    } else {
      console.log(`   ↳ Admin user ${ADMIN_EMAIL} already exists — skipped`);
    }
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });
    console.log(`   ↳ Created admin: ${ADMIN_EMAIL}`);
    console.log(`   ↳ Password:      ${ADMIN_PASSWORD}`);
  }

  // ── 2. Categories ─────────────────────────────────────────────────────────
  console.log("\n🗂️   Seeding categories…");
  const categoryIds: Record<string, mongoose.Types.ObjectId> = {};
  for (const cat of CATEGORIES) {
    const s = slug(cat.name);
    const doc = await Category.findOneAndUpdate(
      { slug: s },
      { ...cat, slug: s, isActive: true },
      { upsert: true, new: true }
    );
    categoryIds[cat.name] = doc._id;
    console.log(`   ↳ ${cat.name}`);
  }

  // ── 3. Brands ─────────────────────────────────────────────────────────────
  console.log("\n🏷️   Seeding brands…");
  const brandIds: Record<string, mongoose.Types.ObjectId> = {};
  for (const brand of BRANDS) {
    const s = slug(brand.name);
    const doc = await Brand.findOneAndUpdate(
      { slug: s },
      { ...brand, slug: s, isActive: true },
      { upsert: true, new: true }
    );
    brandIds[brand.name] = doc._id;
    console.log(`   ↳ ${brand.name}`);
  }

  // ── 4. Products ───────────────────────────────────────────────────────────
  console.log("\n📦  Seeding products…");
  const PRODUCTS = [
    {
      name: "Wireless Noise-Cancelling Headphones",
      description: "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio.",
      price: 99.99, comparePrice: 149.99, stock: 50, isFeatured: true,
      category: "Electronics", brand: "TechNova",
      tags: ["wireless", "audio", "bluetooth"],
    },
    {
      name: "Smart Watch Pro",
      description: "Feature-packed smartwatch with health tracking, GPS, and a gorgeous AMOLED display.",
      price: 249.99, comparePrice: 299.99, stock: 30, isFeatured: true,
      category: "Electronics", brand: "TechNova",
      tags: ["smartwatch", "fitness", "wearable"],
    },
    {
      name: "USB-C 7-in-1 Hub",
      description: "Expand your laptop with HDMI 4K, 3× USB-A, SD card reader, and 100W power delivery.",
      price: 39.99, comparePrice: 59.99, stock: 100,
      category: "Electronics", brand: "TechNova",
      tags: ["usb-c", "hub", "accessories"],
    },
    {
      name: "Mechanical Keyboard TKL",
      description: "Tenkeyless mechanical keyboard with Cherry MX switches, RGB backlight, and compact design.",
      price: 149.99, stock: 25, isFeatured: true,
      category: "Electronics", brand: "TechNova",
      tags: ["keyboard", "mechanical", "gaming"],
    },
    {
      name: "Men's Classic Polo Shirt",
      description: "Timeless polo shirt in premium cotton. Available in multiple colors, perfect for any occasion.",
      price: 34.99, comparePrice: 49.99, stock: 200,
      category: "Clothing", brand: "StyleCraft",
      tags: ["polo", "men", "casual"],
    },
    {
      name: "Women's Slim Fit Jeans",
      description: "High-quality denim with a modern slim fit. Comfortable stretch fabric for all-day wear.",
      price: 59.99, stock: 150, isFeatured: true,
      category: "Clothing", brand: "StyleCraft",
      tags: ["jeans", "women", "denim"],
    },
    {
      name: "Running Sneakers Ultra",
      description: "Lightweight running shoes with responsive cushioning and breathable mesh upper.",
      price: 89.99, comparePrice: 119.99, stock: 80,
      category: "Clothing", brand: "ProSport",
      tags: ["shoes", "running", "sports"],
    },
    {
      name: "Non-Stick Cookware Set (5pc)",
      description: "Premium 5-piece non-stick cookware set. Dishwasher safe, compatible with all hob types.",
      price: 79.99, comparePrice: 119.99, stock: 40, isFeatured: true,
      category: "Home & Garden", brand: "HomeEase",
      tags: ["cookware", "kitchen", "non-stick"],
    },
    {
      name: "Adjustable Dumbbell Set",
      description: "Space-saving adjustable dumbbells. Replace 15 sets of weights — dial to select 5–52 lbs.",
      price: 299.99, stock: 20,
      category: "Sports", brand: "ProSport",
      tags: ["dumbbells", "fitness", "gym"],
    },
    {
      name: "Yoga Mat Premium",
      description: "Extra-thick 6mm eco-friendly yoga mat with non-slip surface and carry strap.",
      price: 29.99, stock: 120,
      category: "Sports", brand: "ProSport",
      tags: ["yoga", "fitness", "mat"],
    },
    {
      name: "The Art of Clean Code",
      description: "A practical guide to writing maintainable, readable, and efficient code. A must-read for every developer.",
      price: 24.99, stock: 200, isFeatured: true,
      category: "Books",
      tags: ["programming", "clean code", "software"],
    },
    {
      name: "LEGO City Police Station",
      description: "Build a detailed police station with 743 pieces. Includes 5 minifigures and accessories.",
      price: 69.99, comparePrice: 89.99, stock: 35,
      category: "Toys",
      tags: ["lego", "building", "kids"],
    },
  ];

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const s = slug(p.name) + "-" + (i + 1);
    const skuCode = sku(p.name, i + 1);

    await Product.findOneAndUpdate(
      { sku: skuCode },
      {
        ...p,
        slug: s,
        sku: skuCode,
        category: categoryIds[p.category],
        brand: p.brand ? brandIds[p.brand] : null,
        isFeatured: p.isFeatured ?? false,
        isActive: true,
      },
      { upsert: true, new: true }
    );
    console.log(`   ↳ ${p.name} — $${p.price}`);
  }

  // ── 5. Banner ─────────────────────────────────────────────────────────────
  console.log("\n🖼️   Seeding banner…");
  await Banner.findOneAndUpdate(
    { title: "Welcome to ShopSphere" },
    {
      title: "Welcome to ShopSphere",
      subtitle: "Discover thousands of products — delivered fast, priced right.",
      link: "/products",
      buttonText: "Shop Now",
      isActive: true,
      order: 1,
    },
    { upsert: true, new: true }
  );
  console.log("   ↳ Homepage welcome banner");

  // ── Done ──────────────────────────────────────────────────────────────────
  console.log("\n✅  Seed complete!\n");
  console.log("─────────────────────────────────────────");
  console.log(`  Admin email    : ${ADMIN_EMAIL}`);
  console.log(`  Admin password : ${ADMIN_PASSWORD}`);
  console.log(`  Login URL      : http://localhost:3000/login`);
  console.log("─────────────────────────────────────────\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("\n❌  Seed failed:", err.message ?? err);
  process.exit(1);
});
