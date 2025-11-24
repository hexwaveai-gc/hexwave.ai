import { NextRequest, NextResponse } from "next/server";
import { uploadMedia } from "@/lib/cloudinary/upload/upload-service";
import { UploadOptions } from "@/lib/cloudinary/upload/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { file, options }: { file: string; options?: UploadOptions } = body;

    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    const result = await uploadMedia(file, options || {});

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 }
    );
  }
}

