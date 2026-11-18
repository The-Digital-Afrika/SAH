import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import * as react from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const source = readFileSync(new URL('../components/MobileSectionFeed.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } });
const exports = {};
vm.runInNewContext(compiled.outputText, { exports, require(name) {
  if (name === 'react/jsx-runtime') return jsx;
  if (name === 'react') return react;
  if (name === '@/lib/wordpress') return { getMagazinePosts: async () => [{ slug: 'current' }], getPostTitle: post => post.title };
  if (name === '@/lib/article-path') return { getArticlePath: post => '/education/' + post.id };
  if (name === './FeaturedStoryCard') return { default: ({ post }) => jsx.jsx('article', { 'data-lead': post.id }) };
  if (name === './LatestMagazine') return { default: () => jsx.jsx('section', { 'data-magazine': true }) };
  if (name === './NewsletterForm') return { default: () => jsx.jsx('form', { 'data-community': true }) };
  if (name === './ArticleCard') return { default: ({ post }) => jsx.jsx('article', { 'data-post': post.id, children: post.title }) };
  if (name === './AdBanner') return { default: () => jsx.jsx('aside', { 'data-ad': true }) };
  if (name === 'next/link') return { default: ({ href, children }) => jsx.jsx('a', { href, children }) };
  throw new Error(name);
} });
const feed = async count => renderToStaticMarkup(await exports.default({ posts: Array.from({length: count}, (_, i) => ({ id: i+1, title: 'Section article ' + (i+1) })), title: 'Education', idPrefix: 'test', page: 2, totalPages: 3, href: '/education' }));

test('mobile sections follow the complete requested reading order', async () => {
  const html = await feed(14);
  const sequence = [...html.matchAll(/data-lead="(\d+)"|data-magazine="true"|data-post="(\d+)"|data-ad="true"|data-community="true"|>Most Recent<|>More articles</g)].map(match => match[1] ? 'lead' : match[2] || (match[0].includes('magazine') ? 'magazine' : match[0].includes('community') ? 'community' : match[0].includes('Most Recent') ? 'recent' : match[0].includes('More articles') ? 'more' : 'ad'));
  assert.deepEqual(sequence, ['lead','magazine','ad','2','3','community','ad','4','5','ad','recent','ad','6','7','ad','8','9','ad','10','11','ad','more','12','13','14']);
  assert.match(html, /href="\/education\?page=1"/);
  assert.match(html, /href="\/education\?page=3"/);
});
test('short categories retain every article without duplicating the lead', async () => {
  const html = await feed(4);
  assert.equal((html.match(/data-lead=/g)||[]).length, 1);
  assert.equal((html.match(/data-post=/g)||[]).length, 3);
  assert.equal((html.match(/data-community=/g)||[]).length, 1);
});
