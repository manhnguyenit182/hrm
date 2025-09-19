import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const { oldPublicId, newEmployeeId, documentType } = await request.json();

    if (!oldPublicId || !newEmployeeId || !documentType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Generate new public ID with actual employee ID
    const newPublicId = `hrm/documents/${newEmployeeId}/${documentType}_${Date.now()}`;

    // Rename/move the file in Cloudinary
    const result = await cloudinary.uploader.rename(oldPublicId, newPublicId, {
      resource_type: "raw",
    });

    return NextResponse.json({
      success: true,
      newUrl: result.secure_url,
      newPublicId: result.public_id,
    });
  } catch (error) {
    console.error("Rename error:", error);
    return NextResponse.json(
      { error: "Failed to rename file" },
      { status: 500 }
    );
  }
}
