import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// Placeholder — settings are env-based in this project
// A real implementation would persist to a Settings collection
export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({
      success: true, message: "OK",
      data: {
        appName: process.env.NEXT_PUBLIC_APP_NAME ?? "ShopSphere",
        appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
        supportEmail: "support@shopsphere.com",
        currency: "USD",
        taxRate: 5,
        shippingFee: 10,
        freeShippingThreshold: 100,
      },
    }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    // In production, persist to DB. For now, echo back.
    return NextResponse.json({ success: true, message: "Settings saved", data: body }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
}
