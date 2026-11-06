import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const legacy = JSON.parse(readFileSync(new URL('../data/legacy-magazine-posts.json', import.meta.url), 'utf8'));
function loadModule(file, require = () => { throw new Error('Unexpected import'); }, extras = {}) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  const exports = {};
  vm.runInNewContext(compiled.outputText, { exports, require, URL, URLSearchParams, Response, AbortSignal, TextEncoder, console, ...extras });
  return exports;
}
const helpers = loadModule('../lib/magazine-posts.ts');
const content = loadModule('../lib/magazine-content.ts');
const plain = value => JSON.parse(JSON.stringify(value));

test('includes October and September and preserves their PDFs and editorial copy', () => {
  for (const month of ['october', 'september']) {
    const post = legacy.find(post => post.slug.includes(month));
    assert.ok(post);
    assert.match(post.content.rendered, /\.pdf/);
    assert.match(post.content.rendered, /<p\b/);
    assert.ok(post._embedded?.['wp:featuredmedia']?.[0]?.source_url);
  }
});

test('uses the CMS version when the same magazine slug is migrated', () => {
  const cms = { ...legacy[0], title: { rendered: 'Edited in the CMS' }, source_origin: undefined };
  const result = helpers.mergeMagazinePosts([cms], legacy);
  assert.equal(result.filter(post => post.slug === cms.slug).length, 1);
  assert.equal(result.find(post => post.slug === cms.slug).title.rendered, 'Edited in the CMS');
});

test('filters imports by category, tags, search and exclusions', () => {
  const october = legacy[0];
  assert.ok(helpers.filterMagazinePosts(legacy, { categories: october.categories[0], search: 'october' }).some(post => post.id === october.id));
  assert.equal(helpers.filterMagazinePosts(legacy, { categories: -999 }).length, 0);
  assert.equal(helpers.filterMagazinePosts(legacy, { tags: -999 }).length, 0);
  assert.equal(helpers.filterMagazinePosts(legacy, { exclude: october.id }).some(post => post.id === october.id), false);
});

test('replaces obsolete flipbook scripts without changing article paragraphs', () => {
  const html = legacy[0].content.rendered;
  const cleaned = content.magazineArticleContent(html);
  assert.doesNotMatch(cleaned, /<script\b|class="_df_book/);
  assert.deepEqual(cleaned.match(/<p\b[^>]*>[\s\S]*?<\/p>/g), html.match(/<p\b[^>]*>[\s\S]*?<\/p>/g));
});

test('combined pagination does not repeat imported issues, and the October reader uses its actual PDF', async () => {
  const primary = Array.from({ length: 8 }, (_, index) => ({ ...legacy[2], id: 10000 + index, slug: `cms-post-${index}`, date: `2026-08-${String(20 - index).padStart(2, '0')}T10:00:00`, title: { rendered: `CMS post ${index}` } }));
  const fetchMock = async input => {
    const url = new URL(String(input));
    if (!url.pathname.endsWith('/posts')) return Response.json([], { status: 200 });
    let posts = primary;
    if (url.searchParams.has('slug')) posts = posts.filter(post => url.searchParams.get('slug').split(',').includes(post.slug));
    const total = posts.length;
    const size = Number(url.searchParams.get('per_page') ?? 10);
    const page = Number(url.searchParams.get('page') ?? 1);
    posts = posts.slice((page - 1) * size, page * size);
    return Response.json(posts, { headers: { 'x-wp-total': String(total), 'x-wp-totalpages': String(Math.ceil(total / size)) } });
  };
  const wp = loadModule('../lib/wordpress.ts', name => {
    if (name === 'next/cache') return { unstable_cache: fn => fn };
    if (name.includes('wp-fallback-posts.json')) return [];
    if (name.includes('legacy-magazine-posts.json')) return legacy;
    if (name.includes('magazine-posts')) return helpers;
    if (name.includes('wordpress-payload')) return loadModule('../lib/wordpress-payload.ts');
    if (name.includes('takeover')) return { parseTakeoverConfig: () => undefined };
    throw new Error(`Unexpected import ${name}`);
  }, { fetch: fetchMock, process: { env: {} } });
  const first = await wp.getPaginatedPosts({ perPage: 4, page: 1 });
  const second = await wp.getPaginatedPosts({ perPage: 4, page: 2 });
  const expected = helpers.mergeMagazinePosts(primary, legacy);
  assert.deepEqual(plain(first.posts.map(post => post.slug)), plain(expected.slice(0, 4).map(post => post.slug)));
  assert.deepEqual(plain(second.posts.map(post => post.slug)), plain(expected.slice(4, 8).map(post => post.slug)));
  assert.equal(first.total, primary.length + legacy.length);
  const october = await wp.getPostBySlug(legacy[0].slug);
  const issue = wp.getMagazineIssueForPost(october);
  assert.match(issue.pdfUrl, /October-2026\.pdf$/);
  assert.equal(issue.slug, 'sa-homeschooling-magazine-october-2026');
  assert.equal(wp.getMagazineIssueForPost({ ...primary[0], content: { rendered: '<p>A normal article.</p>' } }), null);
});
