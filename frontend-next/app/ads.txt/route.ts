import { NextResponse } from "next/server";

const adsTxtSources = ["https://cms.homeandschool.co.za/ads.txt", "https://sahomeschooling.com/ads.txt"];

export async function GET() {
  for (const source of adsTxtSources) {
    try {
      const response = await fetch(source, {
        next: {
          revalidate: 3600,
        },
      });

      if (!response.ok) continue;

      const text = (await response.text()).trim();
      if (!text || /<html/i.test(text)) continue;

      return new NextResponse(`${text}\n`, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=3600, s-maxage=3600",
        },
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json({ error: "ads.txt is unavailable." }, { status: 502 });
}
