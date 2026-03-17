import { list } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBlobTokenInfo, getBlobTokenValidation } from "@/lib/blob";

// GET /api/debug/blob
// Admin-only endpoint — visit in browser or Postman to verify Blob token works end-to-end.
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized – sign in to admin first." }, { status: 401 });
    }

    // Step 1: format check
    const validation = getBlobTokenValidation();
    if (!validation.ok) {
      return NextResponse.json(
        {
          status: "FAIL",
          step: "token_format",
          error: validation.error,
          fix: "Set a valid BLOB1_READ_WRITE_TOKEN (or BLOB_READ_WRITE_TOKEN) in .env.local (local) or Vercel Dashboard → Project Settings → Environment Variables (production).",
        },
        { status: 500 }
      );
    }

    const tokenInfo = getBlobTokenInfo();
    if (!tokenInfo?.token) {
      return NextResponse.json(
        {
          status: "FAIL",
          step: "token_runtime",
          error: "Blob token is not available in runtime.",
        },
        { status: 500 }
      );
    }

    // Step 2: live SDK call to Vercel Blob to confirm token actually works
    await list({
      token: tokenInfo.token,
      limit: 1,
    });

    return NextResponse.json({
      status: "OK",
      message: "Blob storage is configured correctly. Token is valid and the Blob store is reachable.",
      tokenVariable: tokenInfo?.key,
      tokenPrefix: tokenInfo?.token.substring(0, 20) + "...",
    });
  } catch (error: any) {
    const message = typeof error?.message === "string" ? error.message : String(error);

    return NextResponse.json(
      {
        status: "FAIL",
        step: "sdk_call",
        error: message,
        fix: [
          "1. Go to vercel.com → your project → Storage tab → connect a Blob store.",
          "2. Copy the read/write token from the Blob store dashboard.",
          "3. Local: paste it in .env.local and restart the dev server.",
          "4. Production: add it under Project Settings → Environment Variables as BLOB1_READ_WRITE_TOKEN (or BLOB_READ_WRITE_TOKEN) and redeploy.",
        ],
      },
      { status: 500 }
    );
  }
}
