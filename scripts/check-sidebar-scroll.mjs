const tabs = await (await fetch('http://localhost:9231/json')).json();
const tab = tabs.find(tab => tab.type === 'page');
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
let sequence = 0;
const pending = new Map();
socket.addEventListener('message', event => {
  const data = JSON.parse(event.data);
  if (data.id && pending.has(data.id)) {
    pending.get(data.id)(data);
    pending.delete(data.id);
  }
});
function call(method, params = {}) {
  return new Promise(resolve => {
    const id = ++sequence;
    pending.set(id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const response = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.error || response.result?.exceptionDetails) throw new Error(JSON.stringify(response));
  return response.result?.result?.value;
}
await call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await call('Network.enable');
await call('Network.setBlockedURLs', { urls: ['*cms.homeandschool.co.za*', '*doubleclick.net*', '*googlesyndication.com*', '*googletagservices.com*'] });
for (const path of process.argv.slice(2)) {
  await call('Page.navigate', { url: `http://localhost:3000${path}` });
  for (let attempt = 0; attempt < 40; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (await evaluate(`Boolean(document.querySelector('aside')?.style.getPropertyValue('--sidebar-sticky-top'))`)) break;
  }
  const result = await evaluate(`(async () => {
    const sidebar = document.querySelector('aside');
    if (!sidebar) return { error: 'No sidebar', title: document.title };
    window.scrollTo(0, 0);
    await new Promise(resolve => setTimeout(resolve, 200));
    const ancestors = [];
    for (let parent = sidebar.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent);
      ancestors.push({ tag: parent.tagName, class: parent.className, overflowX: style.overflowX, overflowY: style.overflowY, height: Math.round(parent.getBoundingClientRect().height) });
    }
    const style = getComputedStyle(sidebar);
    const initial = sidebar.getBoundingClientRect();
    const threshold = initial.bottom - innerHeight + 16;
    window.scrollTo(0, Math.max(0, threshold + 100));
    await new Promise(resolve => setTimeout(resolve, 300));
    const first = { scroll: scrollY, top: sidebar.getBoundingClientRect().top, bottom: sidebar.getBoundingClientRect().bottom };
    window.scrollBy(0, 300);
    await new Promise(resolve => setTimeout(resolve, 300));
    const second = { scroll: scrollY, top: sidebar.getBoundingClientRect().top, bottom: sidebar.getBoundingClientRect().bottom };
    return { position: style.position, top: style.top, sidebarHeight: Math.round(initial.height), ancestors, first, second, stays: Math.abs(first.top - second.top) < 2 && second.scroll > first.scroll + 100 };
  })()`);
  console.log(JSON.stringify({ path, ...result }));
}
socket.close();
