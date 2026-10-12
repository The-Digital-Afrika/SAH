const fs = require("fs");
const path = require("path");

const posts = require("../parenting-all-posts.json");
const dataDir = path.resolve(__dirname, "../frontend/data");

const customFiles = {
  "festive-rocky-road-recipe-no-bake": "sarah-miller-recipes.html",
  "fall-off-the-bone-oxtail-recipe": "oxtail-recipe.html",
  "twisted-french-toast-sandwich-homeschool-lunch": "french-toast-recipe.html",
  "twisted-french-toast-sandwich-homeschool-lunch-2": "french-toast-recipe.html",
  "bacon-mushroom-paptert-recipe": "paptert-recipe.html",
  "easy-smoothie-recipe-kids-banana-peanut-butter": "smoothie-recipe.html",
  "foundations-for-academic-success-south-africa": "academic-building-blocks.html",
  "holistic-school-readiness-sa-parent-guide": "big-school-confidence.html",
  "boost-childs-academic-performance-homeschooling": "nurture-love-learning.html",
};

const imageMap = {
  "parenting-during-exams-south-africa-guide": "photo-studying.jpg",
  "homeschool-organisation-south-africa": "photo-desk-supplies.jpg",
  "child-online-safety-south-africa-fpb-guide": "photo-online-learning-family.png",
  "financial-literacy-for-kids-sa-homeschooling": "photo-leadership-booklet.jpg",
  "festive-rocky-road-recipe-no-bake": "recipe-rocky-road.jpg",
  "fall-off-the-bone-oxtail-recipe": "recipe-oxtail.jpg",
  "twisted-french-toast-sandwich-homeschool-lunch": "recipe-french-toast.jpg",
  "twisted-french-toast-sandwich-homeschool-lunch-2": "recipe-french-toast.jpg",
  "bacon-mushroom-paptert-recipe": "recipe-paptert.jpg",
  "easy-smoothie-recipe-kids-banana-peanut-butter": "recipe-smoothie.jpg",
  "parenting-a-child-with-adhd-donts": "photo-homeschool-family-table.png",
  "madeleine-asks-how-can-i-best-support-my-son-with-dyslexia": "photo-tutor.jpg",
  "adult-concentration-focus-homeschool-parents": "photo-library.jpg",
  "homeschooling-child-with-autism-sa-guide": "photo-homeschool-success.png",
};

const images = [
  "photo-online-learning-family.png",
  "photo-homeschool-family-table.png",
  "photo-studying.jpg",
  "photo-library.jpg",
  "photo-learning-materials.jpg",
  "photo-homeschool-success.png",
  "photo-desk-supplies.jpg",
  "photo-tutor.jpg",
  "photo-classroom.jpg",
  "photo-leadership-booklet.jpg",
];

function decode(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\u2018/g, "'")
    .replace(/\u2019/g, "'")
    .replace(/\u201c/g, "\"")
    .replace(/\u201d/g, "\"")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, "\"")
    .replace(/&#8221;/g, "\"")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function crop(value, max = 170) {
  const clean = decode(value);
  return clean.length > max ? `${clean.slice(0, max).trim()}...` : clean;
}

fs.mkdirSync(dataDir, { recursive: true });

const items = posts.map((post, index) => ({
  title: decode(post.title.rendered),
  url: customFiles[post.slug] || `${post.slug}.html`,
  category: post.slug.includes("recipe") || post.slug.includes("smoothie") || post.slug.includes("oxtail") || post.slug.includes("paptert") || post.slug.includes("french-toast")
    ? "Cooking & Bonding"
    : "Parenting",
  excerpt: crop(post.excerpt.rendered),
  author: decode(post._embedded?.author?.[0]?.name || post.yoast_head_json?.author || "SA Homeschooling"),
  image: `images/${imageMap[post.slug] || images[index % images.length]}`,
}));

fs.writeFileSync(
  path.join(dataDir, "parenting-posts.json"),
  `${JSON.stringify(items, null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${items.length} Parenting data items.`);
