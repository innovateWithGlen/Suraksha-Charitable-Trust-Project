import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getCoverImageBlobAccess,
  getBlobTokenInfo,
  getBlobTokenValidation,
  isAllowedImageMimeType,
} from "@/lib/blob";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  return fileName.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Temporary diagnostic: verify token is available in server runtime.
    const tokenInfo = getBlobTokenInfo();
    if (!tokenInfo?.token) {
      console.error("[BLOB] BLOB1_READ_WRITE_TOKEN/BLOB_READ_WRITE_TOKEN is UNDEFINED in the server environment.");
    } else {
      console.log(
        `[BLOB] Token found via ${tokenInfo.key}. Starts with:`,
        `${tokenInfo.token.substring(0, 20)}...`
      );
    }

    const blobValidation = getBlobTokenValidation();
    if (!blobValidation.ok) {
      return NextResponse.json({ error: blobValidation.error }, { status: 500 });
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile || !(imageFile instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!isAllowedImageMimeType(imageFile.type)) {
      return NextResponse.json(
        { error: "Only JPG, JPEG, PNG, and WEBP image files are allowed." },
        { status: 400 }
      );
    }

    if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Image size must be 5 MB or smaller." },
        { status: 400 }
      );
    }

    const safeName = sanitizeFileName(imageFile.name || "image");
    const filename = `csr-projects/cover-images/${Date.now()}-${safeName}`;

    if (!tokenInfo?.token) {
      return NextResponse.json(
        {
          error: "Blob storage is not configured. Missing Blob read/write token in runtime.",
        },
        { status: 500 }
      );
    }

    const uploaded = await put(filename, imageFile, {
      token: tokenInfo.token,
      access: getCoverImageBlobAccess(),
      addRandomSuffix: true,
      contentType: imageFile.type,
    });

    return NextResponse.json({ url: uploaded.url }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/uploads/images error:", error);

    if (typeof error?.message === "string" && error.message.toLowerCase().includes("blob")) {
      return NextResponse.json(
        {
          error:
            "Blob storage is not configured correctly. Verify BLOB1_READ_WRITE_TOKEN (or BLOB_READ_WRITE_TOKEN) in server environment and restart the server.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
