import { submitComment } from "@/lib/comment-submission";

export async function POST(request: Request) {
  const wordpressOrigin = new URL(process.env.NEXT_PUBLIC_WP_API_URL ?? "https://cms.homeandschool.co.za/wp-json").origin;
  const siteOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://homeandschool.co.za").origin;
  return submitComment(request, { wordpressOrigin, siteOrigin });
}
