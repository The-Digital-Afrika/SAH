import posts from "@/data/search-posts.json";
import { partners } from "./partners";
import { getArticlePath } from "./article-path";
import { searchPages, type SearchItem } from "./search-types";
import { formatPostDate, getFeaturedImage, getPostAuthor, getPostCategories, getPostExcerpt, getPostTitle, stripHtml, type WPPost } from "./wordpress";

const articleItems: SearchItem[] = (posts as unknown as WPPost[]).map(post => ({
  title: getPostTitle(post), url: getArticlePath(post),
  category: getPostCategories(post).map(category => category.name).join(", ") || "Article",
  excerpt: getPostExcerpt(post).slice(0, 240), image: getFeaturedImage(post).src,
  author: getPostAuthor(post), date: formatPostDate(post.date),
  text: stripHtml(post.content.rendered),
}));
const authors = new Map<string, SearchItem>();
for (const post of posts as unknown as WPPost[]) {
  for (const author of post._embedded?.author ?? []) {
    authors.set(author.slug, { title: author.name, url: `/authors/${author.slug}`, category: "Author", text: author.description });
  }
}
const items: SearchItem[] = [
  ...articleItems, ...searchPages, ...authors.values(),
  ...partners.map(partner => ({ title: partner.name, url: `/directory/${partner.slug}`, category: "Directory", text: JSON.stringify(partner), excerpt: partner.shortDescription, image: partner.logo })),
];
const normalize = (text: string) => stripHtml(text).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const index = items.map(item => ({ item, title: normalize(item.title), text: normalize(`${item.title} ${item.category} ${item.author ?? ""} ${item.text ?? ""}`) }));

export function searchSiteContent(query: string, page = 1) {
  const phrase = normalize(query).slice(0, 200);
  const words = phrase.split(/\s+/).filter(Boolean);
  if (!words.length) return { results: [], hasMore: false, total: 0 };
  const matches = index.filter(entry => words.every(word => entry.text.includes(word)))
    .map(entry => ({ ...entry, score: (entry.title.includes(phrase) ? 100 : 0) + words.filter(word => entry.title.includes(word)).length * 10 }))
    .sort((a, b) => b.score - a.score);
  const start = (page - 1) * 20;
  return {
    results: matches.slice(start, start + 20).map(({ item }) => ({ title: item.title, url: item.url, category: item.category, excerpt: item.excerpt, image: item.image, author: item.author, date: item.date })),
    total: matches.length, hasMore: start + 20 < matches.length,
  };
}
