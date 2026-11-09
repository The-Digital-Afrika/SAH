import type { WPPost } from "./wordpress";

const sectionAliases: Record<string, string> = {
  "newspack-featured": "education",
  "partner": "parenting",
  "partner-2": "partners",
  "newspack-ask-dalena": "ask-dalena",
  "cooking-and-bonding": "cooking-bonding",
};

export function getArticlePath(post: Pick<WPPost, "slug" | "_embedded">): string {
  const terms = post._embedded?.["wp:term"]?.flat() ?? [];
  const category = terms.find(term => term.taxonomy === "category");
  const slug = category?.slug || "uncategorized";
  const section = sectionAliases[slug] ?? slug;
  return `/${encodeURIComponent(section)}/${post.slug}`;
}
