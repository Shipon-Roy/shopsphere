import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// PUT /api/admin/settings/logo — upload logo (stored as env/static in this project)
// In production this would upload to cloud storage and persist the URL
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file provided" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, message: "File must be an image" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "File size must be under 5MB" },
        { status: 400 }
      );
    }

    // NOTE: In a real implementation, upload to S3/Cloudinary here.
    // For now, acknowledge the upload and return a placeholder URL.
    return NextResponse.json(
      {
        success: true,
        message: "Logo received. Configure cloud storage to persist it.",
        data: { filename: file.name, size: file.size, type: file.type },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    if (msg === "FORBIDDEN") return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
