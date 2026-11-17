import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function cms(fetch) {
  const source = readFileSync(new URL('../lib/wordpress.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
  const exports = {};
  vm.runInNewContext(compiled.outputText, {
    exports, fetch, URL, URLSearchParams, AbortSignal, Response,
    process: { env: { NODE_ENV: 'development' } }, console: { warn() {} },
    require(name) {
      if (name === 'next/cache') return { unstable_cache: fn => fn };
      if (name === '@/lib/wordpress-payload') return { prepareWordPressCacheValue: v => v, resolveWordPressCacheValue: async v => v };
      if (name === '@/lib/takeover') return { parseTakeoverConfig: () => null };
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  return exports;
}
const plain = value => JSON.parse(JSON.stringify(value));

test('missing CMS article stays missing instead of showing an imported magazine', async () => {
  const api = cms(async () => Response.json([]));
  assert.equal(await api.getPostBySlug('sa-homeschooling-beyond-september-2026-issue-is-here'), null);
  assert.deepEqual(plain(await api.getPosts()), []);
  assert.deepEqual(plain(await api.getMagazinePosts()), []);
});

test('CMS outage returns empty lists and no saved article or category', async () => {
  const api = cms(async () => { throw new Error('CMS offline'); });
  assert.deepEqual(plain(await api.getPosts()), []);
  assert.deepEqual(plain(await api.getPaginatedPosts()), { posts: [], total: 0, totalPages: 0 });
  assert.equal(await api.getPostBySlug('sa-homeschooling-beyond-september-2026-issue-is-here'), null);
  assert.equal(await api.getCategoryBySlug('education'), null);
  assert.deepEqual(plain(await api.getCategories()), []);
  assert.deepEqual(plain(await api.getAdjacentPosts({ date: '2026-01-01', slug: 'test', id: 1 })), { previous: null, next: null });
});

test('uses published CMS results and pagination without adding imported content', async () => {
  const requests = [];
  const article = { id: 1, slug: 'cms-only-story' };
  const api = cms(async url => {
    requests.push(new URL(url));
    return Response.json([article], { headers: { 'x-wp-total': '1', 'x-wp-totalpages': '1' } });
  });
  const result = await api.getPaginatedPosts({ page: 1, perPage: 8 });
  assert.deepEqual(plain(result), { posts: [article], total: 1, totalPages: 1 });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].origin, 'https://cms.homeandschool.co.za');
  assert.equal(requests[0].searchParams.get('status'), 'publish');
  assert.equal(requests[0].searchParams.get('per_page'), '8');
  assert.deepEqual(plain(await api.getPostBySlug(article.slug)), article);
});
