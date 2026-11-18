import { searchSiteContent } from "@/lib/site-search";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim().slice(0, 200) ?? "";
  const requestedPage = Number(params.get("page") ?? 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  return Response.json(searchSiteContent(query, page));
}
