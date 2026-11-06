import { submitNewsletter } from "@/lib/newsletter-submission";

export async function POST(request: Request) {
  return submitNewsletter(request, { siteOrigin: process.env.NEXT_PUBLIC_SITE_URL ?? "https://homeandschool.co.za" });
}
