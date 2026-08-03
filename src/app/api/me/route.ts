import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";
import { requireAuth } from "@/lib/auth";

// GET /api/me — get current user profile
export async function GET() {
  try {
    const authUser = await requireAuth();
    await connectDB();
    const user = await UserModel.findById(authUser.userId).lean();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "OK", data: user }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unauthorized";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/me — update profile (name only for now)
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await requireAuth();
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : undefined;

    if (!name || name.length < 2) {
      return NextResponse.json({ success: false, message: "Name must be at least 2 characters" }, { status: 400 });
    }

    await connectDB();
    const user = await UserModel.findByIdAndUpdate(
      authUser.userId,
      { name },
      { new: true, runValidators: true }
    ).lean();

    return NextResponse.json({ success: true, message: "Profile updated", data: user }, { status: 200 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
