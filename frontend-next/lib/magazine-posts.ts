import type { WPPost } from "./wordpress";

export type PostFilters = { categories?: number | number[]; tags?: number | number[]; exclude?: number | number[]; search?: string };
const ids = (value?: number | number[]) => new Set(Array.isArray(value) ? value : value === undefined ? [] : [value]);

export function filterMagazinePosts(posts: WPPost[], options: PostFilters = {}) {
  const categories = ids(options.categories);
  const tags = ids(options.tags);
  const excluded = ids(options.exclude);
  const search = options.search?.trim().toLowerCase();
  return posts.filter(post => !excluded.has(post.id) &&
    (!categories.size || post.categories.some(id => categories.has(id))) &&
    (!tags.size || post.tags?.some(id => tags.has(id))) &&
    (!search || `${post.slug} ${post.title.rendered} ${post.excerpt.rendered} ${post.content.rendered}`.toLowerCase().includes(search)));
}

export function mergeMagazinePosts(primary: WPPost[], imported: WPPost[]) {
  const bySlug = new Map(imported.map(post => [post.slug, post]));
  // The CMS wins automatically once an imported issue is migrated there.
  primary.forEach(post => bySlug.set(post.slug, post));
  return [...bySlug.values()].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
}
