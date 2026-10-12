import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/takeover.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const exported = {};
vm.runInNewContext(compiled.outputText, { exports: exported, URL });
const { parseTakeoverConfig, colorsForAd, fallbackTakeoverColors } = exported;
const palette = ['#101c2b', '#24a6bf', '#74a844'];
const banner = { imageUrl: '/ads/eduxplore.jpg', href: 'https://eduxplore.co.za/', alt: 'EduXplore', width: 798, height: 204, colors: palette };
const detail = { slotId: 'top', isEmpty: false, creativeId: 12, lineItemId: 34 };
const plain = value => JSON.parse(JSON.stringify(value));

test('accepts a structured image banner and its matching palette', () => {
  assert.deepEqual(plain(parseTakeoverConfig({ banner })), { banner, campaigns: [] });
  assert.deepEqual(plain(parseTakeoverConfig(JSON.stringify({ banner }))), { banner, campaigns: [] });
});

test('rejects malformed configuration, unsafe links, and CSS values', () => {
  for (const value of [undefined, null, 'not json', [], {}, { banner: { ...banner, href: 'javascript:alert(1)' } },
    { banner: { ...banner, imageUrl: '//evil.example/ad.jpg' } }, { banner: { ...banner, imageUrl: '/\\evil.example/ad.jpg' } },
    { banner: { ...banner, colors: ['red;display:none', '#fff', '#000'] } },
    { banner: { ...banner, width: -1 } }, { banner: { ...banner, height: Infinity } },
    { banner: { ...banner, alt: ' ' } }]) assert.equal(parseTakeoverConfig(value), undefined);
});

test('retains valid campaign metadata even if its optional banner is invalid', () => {
  const result = parseTakeoverConfig({ banner: { ...banner, href: 'data:text/html,bad' },
    campaigns: [{ creativeIds: [12, '13', -1, null], colors: palette }] });
  assert.deepEqual(plain(result), { campaigns: [{ creativeIds: [12], lineItemIds: [], colors: palette }] });
});

test('selects colours for the actual rendered creative rather than the first campaign', () => {
  const config = parseTakeoverConfig({ campaigns: [
    { creativeIds: [99], colors: ['#111', '#222', '#333'] },
    { creativeIds: [12], colors: palette },
  ] });
  assert.deepEqual(plain(colorsForAd(config, detail)), palette);
});

test('creative palette takes precedence over a broader line-item palette', () => {
  const config = parseTakeoverConfig({ campaigns: [
    { lineItemIds: [34], colors: ['#111', '#222', '#333'] },
    { creativeIds: [12], colors: palette },
  ] });
  assert.deepEqual(plain(colorsForAd(config, detail)), palette);
  assert.deepEqual(plain(colorsForAd(config, { ...detail, creativeId: 98 })), ['#111', '#222', '#333']);
});

test('unconfigured or empty refreshed ads reset the previous campaign colours', () => {
  const config = parseTakeoverConfig({ campaigns: [{ creativeIds: [12], colors: palette }] });
  assert.deepEqual(plain(colorsForAd(config, detail)), palette);
  assert.deepEqual(plain(colorsForAd(config, { ...detail, creativeId: 99 })), plain(fallbackTakeoverColors));
  assert.deepEqual(plain(colorsForAd(config, { ...detail, isEmpty: true })), plain(fallbackTakeoverColors));
  assert.deepEqual(plain(colorsForAd(undefined, detail)), plain(fallbackTakeoverColors));
});

test('fallback remains visibly colourful without campaign settings or ad fill', () => {
  assert.deepEqual(plain(fallbackTakeoverColors), ['#12536e', '#329fb0', '#b7ac54']);
});
