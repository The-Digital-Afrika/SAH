import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/wordpress-payload.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const exported = {};
vm.runInNewContext(compiled.outputText, { exports: exported, TextEncoder });
const { compactWordPressPayload, prepareWordPressCacheValue, resolveWordPressCacheValue } = exported;

test('reduces a response over 3 MB without losing article text, authors, images or pagination', () => {
  const article = { id: 1, title: { rendered: 'A full article' }, content: { rendered: '<p>Original article text.</p>' },
    aioseo_head: 'x'.repeat(3100000), aioseo_meta_data: { schema: 'unused' },
    aioseo_head_json: { 'twitter:image': 'https://example.com/cover.jpg', schema: { unused: true } },
    _embedded: { author: [{ id: 2, name: 'Author', aioseo_head: 'unused' }], 'wp:featuredmedia': [{ source_url: 'https://example.com/image.jpg', media_details: { width: 1000, height: 600 } }] } };
  const raw = { posts: [article], total: 40, totalPages: 2 };
  assert.ok(JSON.stringify(raw).length > 3000000);
  const result = prepareWordPressCacheValue(raw);
  assert.equal(result.cacheable, true);
  assert.ok(JSON.stringify(result).length < 1000);
  assert.equal(result.value.posts[0].content.rendered, article.content.rendered);
  assert.equal(result.value.posts[0]._embedded.author[0].name, 'Author');
  assert.equal(result.value.posts[0]._embedded['wp:featuredmedia'][0].source_url, 'https://example.com/image.jpg');
  assert.equal(result.value.posts[0].aioseo_head_json['twitter:image'], 'https://example.com/cover.jpg');
  assert.equal(result.value.total, 40);
  assert.equal(result.value.totalPages, 2);
});

test('retains cover metadata from HTML when JSON image metadata is absent', () => {
  const result = compactWordPressPayload({ aioseo_head: '<meta property="og:image" content="https://example.com/cover.jpg">' });
  assert.equal(result.aioseo_head_json['og:image'], 'https://example.com/cover.jpg');
});

test('keeps an oversized real article available without trying to cache its full text', async () => {
  const value = { content: { rendered: 'A very long article. '.repeat(150000) } };
  const marker = prepareWordPressCacheValue(value);
  assert.equal(marker.cacheable, false);
  assert.ok(JSON.stringify(marker).length < 100);
  let calls = 0;
  const result = await resolveWordPressCacheValue(marker, async () => { calls++; return value; });
  assert.equal(result.content.rendered, value.content.rendered);
  assert.equal(calls, 1);
});

test('counts escaped JSON and UTF-8, not just plain character length', () => {
  const value = { content: { rendered: '"\\\n😀'.repeat(200000) } };
  assert.equal(prepareWordPressCacheValue(value).cacheable, false);
});

test('uses a cache hit without fetching WordPress again and retains ad settings', async () => {
  const result = await resolveWordPressCacheValue(prepareWordPressCacheValue({ meta: { placement: 'article-sidebar' }, acf: { html: '<div>Ad</div>' } }), async () => { throw new Error('Unexpected request'); });
  assert.equal(result.meta.placement, 'article-sidebar');
  assert.equal(result.acf.html, '<div>Ad</div>');
});
