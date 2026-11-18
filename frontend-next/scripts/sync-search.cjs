const fs = require('node:fs');
const path = require('node:path');
const origin = (process.env.NEXT_PUBLIC_WP_API_URL || 'https://cms.homeandschool.co.za/wp-json').replace(/\/$/, '');
async function load(endpoint, page) {
  const url = new URL(origin + '/wp/v2/' + endpoint);
  Object.entries({ per_page: 20, page, status: 'publish', _embed: 1, _fields: 'id,slug,date,title,excerpt,content,categories,_links,_embedded' }).forEach(([k,v]) => url.searchParams.set(k,v));
  let failure;
  for (let attempt=0;attempt<3;attempt++) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!r.ok) throw new Error('CMS HTTP ' + r.status);
      return { posts: await r.json(), pages: Number(r.headers.get('x-wp-totalpages')) };
    } catch (e) { failure=e; }
  }
  throw failure;
}
(async () => {
  const posts=[];
  for(let page=1,pages=1;page<=pages;page++) {
    const result=await load('posts',page); pages=result.pages;
    posts.push(...result.posts);
    console.log('Indexed page '+page+'/'+pages+' ('+posts.length+' posts)');
  }
  const target=path.join(__dirname,'../data/search-posts.json');
  fs.writeFileSync(target+'.tmp', JSON.stringify(posts));
  fs.renameSync(target+'.tmp',target);
})().catch(e=>{ console.error(e); process.exitCode=1; });
