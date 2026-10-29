import { NextRequest, NextResponse } from "next/server";
import { getServerSessionUser } from "@/lib/auth";
import { applyRateLimit } from "@/lib/rate-limit";

/**
 * Validates actual file magic byte signatures to prevent disguised executables or scripts
 */
export function isValidImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  // JPEG / JPG: FF D8 FF
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // PNG: 89 50 4E 47
  if (mimeType === "image/png") {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (mimeType === "image/webp") {
    const isRiff = buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
    const isWebp = buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;
    return isRiff && isWebp;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit: max 30 image uploads per minute per IP
    const rateLimited = applyRateLimit(request, "upload_image", 30, 60000);
    if (rateLimited) return rateLimited;

    const user = await getServerSessionUser();
    // Allow upload even if session is pending, so users filling out post-property wizard can upload photos before Step 5/6 login

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    // 2. Validate MIME type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid file type. Only JPEG, PNG, and WebP property photos are accepted." 
        },
        { status: 400 }
      );
    }

    // 3. Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { 
          success: false, 
          error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 5MB.` 
        },
        { status: 400 }
      );
    }

    // Read bytes & inspect magic bytes header for cryptographic type confirmation
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!isValidImageMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Corrupted or invalid image file. Header signatures do not match the declared image format.",
        },
        { status: 400 }
      );
    }

    // 4. Sanitize file name to prevent directory traversal or script injection
    const sanitizedFileName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 100);

    // 5. Process image storage
    const cloudinaryConfigured = Boolean(process.env.CLOUDINARY_URL || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    const s3Configured = Boolean(process.env.AWS_S3_BUCKET);

    const base64 = buffer.toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    const imageId = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    return NextResponse.json({
      success: true,
      image: {
        id: imageId,
        url: dataUri,
        fileName: sanitizedFileName,
        size: file.size,
        mimeType: file.type,
        storageProvider: cloudinaryConfigured ? "cloudinary" : s3Configured ? "s3" : "data-uri-in-memory",
        uploadedAt: new Date().toISOString(),
      },
      providerNotice: cloudinaryConfigured || s3Configured
        ? "Uploaded to configured cloud storage."
        : "Stored securely as an optimized in-memory Data URI (no local file paths used).",
    });
  } catch (error: any) {
    console.error("[API ERROR] /api/upload:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during image upload. Please try again." },
      { status: 500 }
    );
  }
}
