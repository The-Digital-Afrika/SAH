import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/article-path.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const exports = {};
vm.runInNewContext(compiled.outputText, { exports });
const { getArticlePath } = exports;
const post = (...slugs) => ({ slug: 'example-story', _embedded: { 'wp:term': [slugs.map(slug => ({ slug, taxonomy: 'category' }))] } });

test('maps CMS category slugs to public page names', () => {
  for (const [slug, section] of Object.entries({ 'newspack-featured': 'education', education: 'education', partner: 'parenting', development: 'development', 'partner-2': 'partners', 'newspack-ask-dalena': 'ask-dalena', 'cooking-and-bonding': 'cooking-bonding' })) {
    assert.equal(getArticlePath(post(slug)), `/${section}/example-story`);
  }
});

test('uses the first category consistently when an article has multiple categories', () => {
  assert.equal(getArticlePath(post('development', 'newspack-featured')), '/development/example-story');
});

test('ignores tags and handles additional or missing categories', () => {
  assert.equal(getArticlePath(post('careers')), '/careers/example-story');
  assert.equal(getArticlePath({ slug: 'example-story' }), '/uncategorized/example-story');
  const tagged = post('newspack-featured');
  tagged._embedded['wp:term'].unshift([{ slug: 'a-tag', taxonomy: 'post_tag' }]);
  assert.equal(getArticlePath(tagged), '/education/example-story');
});

test('every cached article receives a category URL without changing its slug', () => {
  for (const file of ['wp-fallback-posts.json', 'legacy-magazine-posts.json']) {
    const posts = JSON.parse(readFileSync(new URL(`../data/${file}`, import.meta.url), 'utf8'));
    for (const article of posts) {
      assert.ok(getArticlePath(article).endsWith(`/${article.slug}`));
      assert.match(getArticlePath(article), /^\/[^/]+\/[^/]+$/);
    }
  }
});

test('legacy article URLs and incorrect category URLs redirect to the canonical category', async () => {
  const articleSource = readFileSync(new URL('../components/ArticlePage.tsx', import.meta.url), 'utf8');
  const articleCode = ts.transpileModule(articleSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
  const module = { exports: {} };
  const article = post('newspack-featured');
  vm.runInNewContext(articleCode.outputText, {
    exports: module.exports,
    require: name => {
      if (name === '@/lib/article-path') return { getArticlePath };
      if (name === '@/lib/wordpress') return { getPostBySlug: async () => article };
      if (name === 'next/navigation') return { permanentRedirect: path => { throw new Error(`redirect:${path}`); } };
      return {};
    },
  });
  for (const params of [{ slug: article.slug }, { slug: article.slug, section: 'parenting' }]) {
    await assert.rejects(module.exports.default({ params: Promise.resolve(params) }), /redirect:\/education\/example-story/);
  }
});
