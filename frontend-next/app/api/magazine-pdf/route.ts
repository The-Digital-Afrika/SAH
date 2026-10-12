import { NextRequest, NextResponse } from "next/server";

const allowedHosts = new Set(["cms.homeandschool.co.za", "sahomeschooling.com", "www.sahomeschooling.com"]);

export async function GET(request: NextRequest) {
  const source = request.nextUrl.searchParams.get("url");
  const range = request.headers.get("range");

  if (!source) {
    return NextResponse.json({ error: "Missing PDF URL." }, { status: 400 });
  }

  let pdfUrl: URL;

  try {
    pdfUrl = new URL(source);
  } catch {
    return NextResponse.json({ error: "Invalid PDF URL." }, { status: 400 });
  }

  if (!allowedHosts.has(pdfUrl.hostname) || !pdfUrl.pathname.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "PDF URL is not allowed." }, { status: 400 });
  }

  const upstreamHeaders = new Headers({
    accept: "application/pdf",
  });

  if (range) {
    upstreamHeaders.set("range", range);
  }

  const upstream = await fetch(pdfUrl.toString(), {
    headers: upstreamHeaders,
    ...(range
      ? { cache: "no-store" as const }
      : {
          next: {
            revalidate: 3600,
          },
        }),
  });

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Could not load magazine PDF." }, { status: upstream.status || 502 });
  }

  const responseHeaders = new Headers({
    "content-type": upstream.headers.get("content-type") ?? "application/pdf",
    "content-disposition": "inline",
    "cache-control": range ? "no-store" : "public, max-age=3600, s-maxage=3600",
    "accept-ranges": upstream.headers.get("accept-ranges") ?? "bytes",
  });
  const contentLength = upstream.headers.get("content-length");
  const contentRange = upstream.headers.get("content-range");

  if (contentLength) responseHeaders.set("content-length", contentLength);
  if (contentRange) responseHeaders.set("content-range", contentRange);

  return new NextResponse(upstream.body, {
    status: upstream.status === 206 ? 206 : 200,
    headers: responseHeaders,
  });
}
