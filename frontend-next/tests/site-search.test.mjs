import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

let networkCalls = 0;
const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  if (name === 'next/cache') return { unstable_cache: fn => fn };
  if (name.endsWith('.json')) return JSON.parse(readFileSync(new URL('../' + name.replace('@/', ''), import.meta.url)));
  const file = name.replace('@/', '').replace(/^\.\//, 'lib/') + '.ts';
  const source = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } });
  const exports = {};
  cache.set(name, exports);
  vm.runInNewContext(compiled.outputText, { exports, require: load, process: { env: {} }, console, URL, AbortSignal, fetch: () => { networkCalls++; throw new Error('Network unavailable'); } });
  return exports;
}
const { searchSiteContent } = load('@/lib/site-search');
test('exams returns published articles without network access', () => {
  const result = searchSiteContent('exams');
  assert.ok(result.results.length > 0);
  assert.ok(result.results.some(item => item.image && item.excerpt));
  assert.equal(networkCalls, 0);
});
test('title matches rank first and full article content is searchable', () => {
  for (const query of ['crisis', 'the crisis and the hope']) {
    assert.match(searchSiteContent(query).results[0].title, /The Crisis and the Hope/);
  }
  assert.ok(searchSiteContent('exams').total > 1);
});
test('pagination is stable without duplicate results', () => {
  const first = searchSiteContent('de');
  const second = searchSiteContent('de', 2);
  assert.equal(first.results.length, 20);
  assert.equal(first.hasMore, true);
  const urls = new Set(first.results.map(item => item.url));
  assert.ok(second.results.length > 0);
  assert.ok(second.results.every(item => !urls.has(item.url)));
});
test('empty and unmatched searches return empty results', () => {
  assert.equal(searchSiteContent('').results.length, 0);
  assert.equal(searchSiteContent('zzzznomatch98765').total, 0);
  assert.equal(searchSiteContent('!!!').results.length, 0);
});
