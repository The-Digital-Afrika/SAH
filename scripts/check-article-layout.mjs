import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const tabs = await (await fetch('http://localhost:9231/json')).json();
const tab = tabs.find(tab => tab.type === 'page');
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map();
socket.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  if (data.id && pending.has(data.id)) { pending.get(data.id)(data); pending.delete(data.id); }
});
function call(method, params = {}) {
  return new Promise(resolve => { const id = ++sequence; pending.set(id, resolve); socket.send(JSON.stringify({ id, method, params })); });
}
async function evaluate(expression) {
  const response = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.error || response.result?.exceptionDetails) throw new Error(JSON.stringify(response));
  return response.result?.result?.value;
}
await call('Network.enable');
await call('Network.setBlockedURLs', { urls: ['*doubleclick.net*', '*googlesyndication.com*', '*googletagservices.com*'] });
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
const path = process.argv[2] ?? '/articles/online-schools-in-south-africa-prices-subjects';
await call('Page.navigate', { url: `http://localhost:3000${path}` });
for (let attempt = 0; attempt < 80; attempt++) {
  await new Promise(resolve => setTimeout(resolve, 250));
  if (await evaluate(`Boolean(document.querySelector('[data-article-ad]'))`)) break;
}
const desktop = await evaluate(`(async () => {
  const body = document.querySelector('[data-article-content]');
  if (!body) return { error: 'Article content missing', title: document.title };
  const original = new DOMParser().parseFromString(await (await fetch(location.href)).text(), 'text/html').querySelector('[data-article-content]');
  const copy = body.cloneNode(true);
  copy.querySelectorAll('[data-article-ad]').forEach(ad => ad.remove());
  const card = document.querySelector('.related-editorial-card');
  const title = card?.querySelector('h3');
  const excerpt = card?.querySelector('p');
  return {
    title: document.querySelector('h1')?.textContent,
    inlineAds: body.querySelectorAll('[data-article-ad]').length,
    intactText: copy.textContent === original?.textContent,
    intactLists: copy.querySelectorAll('li').length === original?.querySelectorAll('li').length,
    sidebarFormats: [...document.querySelectorAll('aside [data-ad-format]')].map(ad => ad.dataset.adFormat),
    authorInsideArticle: Boolean(document.querySelector('article [aria-label="About the author"]')),
    overflow: document.documentElement.scrollWidth > innerWidth,
    cardTitleColor: title && getComputedStyle(title).color,
    cardExcerptColor: excerpt && getComputedStyle(excerpt).color,
    cardRadius: card && getComputedStyle(card).borderRadius
  };
})()`);
console.log(JSON.stringify({ desktop }));
assert.equal(desktop.intactText, true, 'Inline ads must preserve the complete article text');
assert.equal(desktop.intactLists, true, 'Inline ads must preserve list items');
assert.equal(desktop.inlineAds, 3, 'The reference article should have three inline placements');
assert.equal(desktop.authorInsideArticle, true);
assert.equal(desktop.overflow, false);
assert.deepEqual(desktop.sidebarFormats, Array.from({ length: 12 }, (_, index) => index % 2 ? 'big' : 'small'));
assert.equal(desktop.cardTitleColor, 'rgb(255, 44, 89)');
assert.equal(desktop.cardExcerptColor, 'rgb(153, 153, 153)');
const screenshot = await call('Page.captureScreenshot', { format: 'png' });
writeFileSync('article-desktop-preview.png', Buffer.from(screenshot.result.data, 'base64'));
await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
await new Promise(resolve => setTimeout(resolve, 500));
console.log(JSON.stringify({ mobile: await evaluate(`({ overflow: document.documentElement.scrollWidth > innerWidth, width: innerWidth, pageWidth: document.documentElement.scrollWidth, sidebarPosition: getComputedStyle(document.querySelector('aside')).position, headingWidth: document.querySelector('h1').getBoundingClientRect().width })`) }));
const mobileShot = await call('Page.captureScreenshot', { format: 'png' });
writeFileSync('article-mobile-preview.png', Buffer.from(mobileShot.result.data, 'base64'));
socket.close();
