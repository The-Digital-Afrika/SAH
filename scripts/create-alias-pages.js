const fs = require("fs");
const path = require("path");

const frontend = path.resolve(__dirname, "../frontend");

const aliases = {
  "online-schools-in-south-africa-prices-subjects": "online-schools-south-africa.html",
  "preparing-for-june-matric-exams-homeschooling": "hidden-value-matric-exams.html",
  "homeschooling-in-south-africa-eduxplore-2026": "eduxplore-2026.html",
  "online-school-to-tertiary-education-guide": "online-school-higher-education.html",
  "maths-vs-maths-literacy-guide": "maths-vs-maths-literacy.html",
  "homeschooling-for-beginners-south-africa-faq": "homeschooling-for-beginners.html",
  "options-after-matric-south-africa-homeschoolers": "options-after-matric.html",
  "foundations-for-academic-success-south-africa": "academic-building-blocks.html",
  "microlearning-strategies-students-south-africa": "microlearning-strategies.html",
  "holistic-school-readiness-sa-parent-guide": "big-school-confidence.html",
  "boost-childs-academic-performance-homeschooling": "nurture-love-learning.html",
  "ai-education-technology-africa-bridging-gaps": "digital-wings-ai-education.html",
  "matric-prelim-exams-importance-sa-university": "nervous-during-prelims.html",
  "festive-rocky-road-recipe-no-bake": "sarah-miller-recipes.html",
  "fall-off-the-bone-oxtail-recipe": "oxtail-recipe.html",
  "twisted-french-toast-sandwich-homeschool-lunch": "french-toast-recipe.html",
  "bacon-mushroom-paptert-recipe": "paptert-recipe.html",
  "easy-smoothie-recipe-kids-banana-peanut-butter": "smoothie-recipe.html",
};

function aliasPage(target) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="0; url=${target}">
  <title>Redirecting | SA Homeschooling &amp; Beyond</title>
  <link rel="canonical" href="${target}">
</head>
<body>
  <p>Redirecting to <a href="${target}">${target}</a>.</p>
  <script>window.location.replace("${target}");</script>
</body>
</html>
`;
}

let written = 0;

for (const [slug, target] of Object.entries(aliases)) {
  const targetPath = path.join(frontend, target);
  if (!fs.existsSync(targetPath)) {
    console.warn(`Skipped ${slug}. Missing target ${target}`);
    continue;
  }

  fs.writeFileSync(path.join(frontend, `${slug}.html`), aliasPage(target), "utf8");
  written += 1;
}

console.log(`Wrote ${written} alias pages.`);
