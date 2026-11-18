const tabs=await(await fetch('http://localhost:9233/json')).json();
const tab=tabs.find(t=>t.type==='page'&&t.url.startsWith('http://localhost:3000'));
const ws=new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(pending.has(d.id)){pending.get(d.id)(d);pending.delete(d.id)}});
const call=(method,params={})=>new Promise(resolve=>{const next=++id;pending.set(next,resolve);ws.send(JSON.stringify({id:next,method,params}))});
await call('Emulation.setDeviceMetricsOverride',{width:Number(process.argv[2]||1440),height:1000,deviceScaleFactor:1,mobile:false});
if(process.argv[3]) { await call('Runtime.evaluate',{expression:'location.href='+JSON.stringify('http://localhost:3000/'+process.argv[3])}); }
else {
console.log(JSON.stringify(await call('Runtime.evaluate',{returnByValue:true,expression:`(() => {
const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {width:Math.round(r.width),x:Math.round(r.x),display:getComputedStyle(el).display,columns:getComputedStyle(el).gridTemplateColumns}};
return {url:location.href,overflow:document.documentElement.scrollWidth>innerWidth,main:rect(document.querySelector('.section-page-content')),panel:rect(document.querySelector('.section-desktop-feed .education-content-grid')),grid:rect(document.querySelector('.section-desktop-feed .education-archive-grid')),cards:[...document.querySelectorAll('.section-desktop-feed .education-archive-grid > a')].slice(0,2).map(rect),mobile:rect(document.querySelector('.mobile-section-feed'))};
})()`}),null,2));
}
ws.close();
