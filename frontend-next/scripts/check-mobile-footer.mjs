const tabs=await(await fetch('http://localhost:9233/json')).json();
const tab=tabs.find(t=>t.type==='page');
const ws=new WebSocket(tab.webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map();
ws.addEventListener('message',e=>{const d=JSON.parse(e.data);if(pending.has(d.id)){pending.get(d.id)(d);pending.delete(d.id)}});
const call=(method,params={})=>new Promise(resolve=>{const next=++id;pending.set(next,resolve);ws.send(JSON.stringify({id:next,method,params}))});
await call('Emulation.setDeviceMetricsOverride',{width:Number(process.argv[2] || 390),height:844,deviceScaleFactor:1,mobile:true});


await new Promise(r=>setTimeout(r,1000));
console.log(JSON.stringify(await call('Runtime.evaluate',{returnByValue:true,expression:`(() => {
const footer=document.querySelector('.home-footer');
if(!footer)return {error:'Footer missing'};
const sections=[...footer.querySelectorAll('.footer-columns > *')].map(el=>{const r=el.getBoundingClientRect();return {name:el.querySelector('h2')?.textContent||'Logo',top:r.top,bottom:r.bottom,width:r.width}});
return {overflow:document.documentElement.scrollWidth>innerWidth,sections,gaps:sections.slice(1).map((s,i)=>Math.round(s.top-sections[i].bottom))};
})()`}),null,2));
ws.close();




