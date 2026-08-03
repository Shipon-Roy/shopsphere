import { NextResponse } from "next/server";

// Categories don't have images in this project — return 404
export async function GET() {
  return new NextResponse("Not found", { status: 404 });
}
