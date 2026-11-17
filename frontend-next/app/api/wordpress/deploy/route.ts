import { getArticlePath } from "@/lib/article-path";
import { getPostBySlug } from "@/lib/wordpress";
import { getCategoryPath } from "@/lib/category-path";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

type WordPressWebhookPayload = {
  post?: {
    post_name?: string;
    post_status?: string;
    slug?: string;
    status?: string;
    categories?: string[];
  };
  slug?: string;
  status?: string;
  post_status?: string;
  categories?: string[];
};

const staticPaths = ["/", "/education", "/directory", "/magazines", "/authors", "/partners", "/ask-dalena"];
const commonCategoryPaths = ["/education", "/parenting", "/development", "/cooking-bonding"];

function getSecret(request: NextRequest) {
  return request.headers.get("x-wordpress-webhook-secret") ?? request.nextUrl.searchParams.get("secret");
}

function getPostSlug(payload: WordPressWebhookPayload) {
  return payload.post?.slug ?? payload.post?.post_name ?? payload.slug;
}

function getCategorySlugs(payload: WordPressWebhookPayload) {
  return payload.post?.categories ?? payload.categories ?? [];
}

async function triggerVercelDeployHook() {
  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

  if (!deployHookUrl) {
    return { skipped: true, reason: "VERCEL_DEPLOY_HOOK_URL is not configured" };
  }

  const response = await fetch(deployHookUrl, {
    method: "POST",
  });

  return {
    skipped: false,
    ok: response.ok,
    status: response.status,
  };
}

async function revalidateWordPress(request: NextRequest, payload: WordPressWebhookPayload) {
  const expectedSecret = process.env.WORDPRESS_WEBHOOK_SECRET;

  if (!expectedSecret) {
    return NextResponse.json({ error: "WORDPRESS_WEBHOOK_SECRET is not configured" }, { status: 500 });
  }

  if (getSecret(request) !== expectedSecret) {
    return NextResponse.json({ error: "Invalid webhook secret" }, { status: 401 });
  }

  // Unpublishing must invalidate cached listings and article pages too.

  const paths = new Set(staticPaths);
  commonCategoryPaths.forEach((path) => paths.add(path));
  const slug = getPostSlug(payload);

  if (slug) {
    paths.add(`/articles/${slug}`);
    const post = await getPostBySlug(slug);
    if (post) paths.add(getArticlePath(post));
  }

  getCategorySlugs(payload).forEach((categorySlug) => {
    paths.add(getCategoryPath(categorySlug));
  });

  revalidateTag("wordpress-json", "max");
  revalidateTag("wordpress-paginated", "max");
  paths.forEach((path) => revalidatePath(path));

  const deployHook = await triggerVercelDeployHook();

  return NextResponse.json({
    revalidated: true,
    paths: [...paths],
    deployHook,
  });
}

export async function GET(request: NextRequest) {
  return revalidateWordPress(request, {
    slug: request.nextUrl.searchParams.get("slug") ?? undefined,
    status: "publish",
  });
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => ({}))) as WordPressWebhookPayload;

  return revalidateWordPress(request, payload);
}
