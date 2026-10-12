const fs = require("fs");

const items = JSON.parse(fs.readFileSync("frontend/data/parenting-posts.json", "utf8"));
const missing = [];
const badStructure = [];

for (const item of items) {
  const filePath = `frontend/${item.url}`;
  if (!fs.existsSync(filePath)) {
    missing.push(item.url);
    continue;
  }

  const html = fs.readFileSync(filePath, "utf8");
  const hasOneHtmlTag = (html.match(/<html/g) || []).length === 1;
  const hasOneBodyTag = (html.match(/<body/g) || []).length === 1;
  const hasHeader = html.includes('class="site-header"');
  const hasFooter = html.includes('class="home-footer"');

  if (!hasOneHtmlTag || !hasOneBodyTag || !hasHeader || !hasFooter) {
    badStructure.push(item.url);
  }
}

console.log(`parenting_items=${items.length}`);
console.log(`missing_pages=${missing.length}`);
console.log(`bad_structure=${badStructure.length}`);

if (missing.length) console.log(missing.join("\n"));
if (badStructure.length) console.log(badStructure.join("\n"));
