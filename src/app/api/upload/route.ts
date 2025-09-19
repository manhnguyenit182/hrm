import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import type { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// POST: Upload PDF file
export async function POST(request: NextRequest) {
  try {
    console.log("📥 Incoming upload request");

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.warn("⚠️ No file found in formData");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("📄 File info:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log("📏 Buffer size:", buffer.length);

    const result: UploadApiResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "raw",
            folder: "hrm/documents",
            public_id: `document_${Date.now()}`,
          },
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse | undefined
          ) => {
            if (error || !result) {
              console.error("❌ Cloudinary error:", error);
              reject(error);
            } else {
              console.log("✅ Cloudinary upload result:", result);
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      original_filename: result.original_filename,
    });
  } catch (error) {
    console.error("🔥 Upload API error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// DELETE: Remove file by publicId
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID is required" },
        { status: 400 }
      );
    }

    console.log("🗑️ Deleting file:", publicId);
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("🔥 Delete API error:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
