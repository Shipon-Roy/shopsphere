import { NextResponse } from "next/server";

// Banners use external link URLs, not stored images — nothing to serve here
export async function GET() {
  return new NextResponse("Not found", { status: 404 });
}
