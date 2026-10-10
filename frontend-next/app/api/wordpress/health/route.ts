import { NextResponse } from "next/server";

const configuredApi = process.env.NEXT_PUBLIC_WP_API_URL ?? "https://cms.homeandschool.co.za/wp-json";

export async function GET() {
  const startedAt = Date.now();
  const api = configuredApi.replace(/\/$/, "");
  const url = `${api}/wp/v2/posts?per_page=1&_embed=1`;

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        accept: "application/json",
        "user-agent": "SA Home&School frontend health check (+https://homeandschool.co.za)",
      },
      signal: AbortSignal.timeout(8000),
    });
    const text = await response.text();
    let firstPostTitle: string | undefined;

    try {
      const data = JSON.parse(text) as Array<{ title?: { rendered?: string } }>;
      firstPostTitle = data[0]?.title?.rendered;
    } catch {
      firstPostTitle = undefined;
    }

    return NextResponse.json({
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      wordpressApi: api,
      firstPostTitle,
      responsePreview: text.slice(0, 240),
      elapsedMs: Date.now() - startedAt,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        wordpressApi: api,
        error: error instanceof Error ? error.message : String(error),
        cause:
          error instanceof Error && "cause" in error
            ? String((error as Error & { cause?: unknown }).cause)
            : undefined,
        elapsedMs: Date.now() - startedAt,
      },
      { status: 502 },
    );
  }
}
