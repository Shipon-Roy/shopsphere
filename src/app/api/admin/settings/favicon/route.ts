import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// PUT /api/admin/settings/favicon — upload favicon
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

    const allowed = ["image/x-icon", "image/png", "image/svg+xml", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Favicon must be ICO, PNG, SVG or WebP" },
        { status: 400 }
      );
    }

    if (file.size > 1 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: "Favicon must be under 1MB" },
        { status: 400 }
      );
    }

    // NOTE: In a real implementation, write to /public/favicon.ico or upload to storage.
    return NextResponse.json(
      {
        success: true,
        message: "Favicon received. Configure cloud storage to persist it.",
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
