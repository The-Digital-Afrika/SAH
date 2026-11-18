import { writeFile } from 'node:fs/promises';

const api = new URL('https://sahomeschooling.com/wp-json/wp/v2/posts');
api.searchParams.set('per_page', '100');
api.searchParams.set('search', 'out now');
api.searchParams.set('_embed', '1');
const pick = (value, keys) => Object.fromEntries(keys.filter(key => key in value).map(key => [key, value[key]]));
const response = await fetch(api, { signal: AbortSignal.timeout(60000) });
if (!response.ok) throw new Error(`Magazine export failed: HTTP ${response.status}`);
const records = await response.json();
const posts = records.filter(post => /dflip|_df_book|df_option_/i.test(post.content.rendered)).map(post => ({
  ...pick(post, ['id', 'date', 'modified', 'slug', 'link', 'author', 'featured_media', 'categories', 'tags', 'title', 'excerpt', 'content']),
  source_origin: 'https://sahomeschooling.com',
  aioseo_head_json: pick(post.aioseo_head_json ?? {}, ['twitter:image', 'og:image']),
  _embedded: {
    author: post._embedded?.author?.map(author => pick(author, ['id', 'name', 'slug', 'description', 'link', 'avatar_urls'])),
    'wp:featuredmedia': post._embedded?.['wp:featuredmedia']?.map(media => pick(media, ['id', 'source_url', 'alt_text', 'media_details'])),
    'wp:term': post._embedded?.['wp:term']?.map(terms => terms.map(term => pick(term, ['id', 'count', 'name', 'slug', 'taxonomy', 'description', 'link']))),
  },
}));
if (!posts.length) throw new Error('No magazine posts were returned; keeping the existing snapshot.');
await writeFile(new URL('../frontend-next/data/legacy-magazine-posts.json', import.meta.url), JSON.stringify(posts, null, 2) + '\n');
console.log(`Saved ${posts.length} public magazine posts. No WordPress content was changed.`);
