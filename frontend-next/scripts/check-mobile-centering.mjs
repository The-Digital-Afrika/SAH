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
const root=document.querySelector('.section-page-layout');if(!root)return {error:'Page not ready',text:document.body.innerText.slice(0,200)};
const selectors=['.home-category-card-grid > *','.google-ad-slot','.house-ad','.home-lead-story','[data-home-sidebar-magazine]','.section-sidebar > [data-resource-ad]','[data-home-category]','[data-home-community-signup]','.mobile-after-community','.mobile-after-education','.mobile-after-development','.mobile-after-parenting','.mobile-after-cooking','.section-most-recent'];
return {overflow:document.documentElement.scrollWidth>innerWidth,blocks:[...root.querySelectorAll(selectors.join(','))].filter(el=>el.getBoundingClientRect().height>0).sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top).map(el=>({name:el.getAttribute('data-home-category')||el.getAttribute('aria-label')||el.className,top:Math.round(el.getBoundingClientRect().top),left:Math.round(el.getBoundingClientRect().left),right:Math.round(innerWidth-el.getBoundingClientRect().right),width:Math.round(el.getBoundingClientRect().width),articles:el.hasAttribute('data-home-category')?[...el.querySelectorAll('.home-category-card-grid > *')].filter(x=>getComputedStyle(x).display!=='none').length:undefined}))};
})()`}),null,2));
ws.close();




