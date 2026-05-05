import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST = process.env.WAHA_BASE_URL
  ? new URL(process.env.WAHA_BASE_URL).hostname
  : "waha-waha.qljgmz.easypanel.host";

const ALLOWED_CONTENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "audio/ogg",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "video/mp4",
  "application/pdf",
]);

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  if (parsed.protocol !== "https:") {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "X-Api-Key": process.env.WAHA_API_KEY ?? "",
      },
    });

    if (!response.ok) {
      if (response.status !== 404) {
        console.error(`[media-proxy] Upstream ${response.status} for: ${url}`);
      }
      return new NextResponse("Failed to fetch media", { status: response.status });
    }

    const rawContentType = response.headers.get("content-type")?.split(";")[0].trim() ?? "";
    const contentType = ALLOWED_CONTENT_TYPES.has(rawContentType)
      ? rawContentType
      : "application/octet-stream";

    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Error fetching media", { status: 500 });
  }
}
