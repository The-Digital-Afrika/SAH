const fs = require("fs");
const path = require("path");

const posts = require("../cooking-bonding-all-posts.json");
const dataDir = path.resolve(__dirname, "../frontend/data");

const customFiles = {
  "festive-rocky-road-recipe-no-bake": "sarah-miller-recipes.html",
  "fall-off-the-bone-oxtail-recipe": "oxtail-recipe.html",
  "twisted-french-toast-sandwich-homeschool-lunch": "french-toast-recipe.html",
  "bacon-mushroom-paptert-recipe": "paptert-recipe.html",
  "easy-smoothie-recipe-kids-banana-peanut-butter": "smoothie-recipe.html",
};

const imageMap = {
  "festive-rocky-road-recipe-no-bake": "recipe-rocky-road.jpg",
  "fall-off-the-bone-oxtail-recipe": "recipe-oxtail.jpg",
  "twisted-french-toast-sandwich-homeschool-lunch-2": "recipe-french-toast.jpg",
  "twisted-french-toast-sandwich-homeschool-lunch": "recipe-toast-blue.jpg",
  "bacon-mushroom-paptert-recipe": "recipe-paptert.jpg",
  "easy-smoothie-recipe-kids-banana-peanut-butter": "recipe-smoothie.jpg",
  "easy-milk-tart-recipe-south-africa": "recipe-paptert.jpg",
  "easy-bread-recipe-for-kids": "recipe-french-toast.jpg",
  "easy-dinner-recipes-kids-cheesy-potato-muffins": "recipe-paptert.jpg",
  "healthy-lunch-ideas-kids-tuna-mango-salad": "recipe-toast-blue.jpg",
  "cooking-with-kids-activities-biltong-muffins-recipe": "recipe-paptert.jpg",
  "pilchard-fish-cakes-recipe-budget-meals-sa": "recipe-oxtail.jpg",
  "easy-family-pasta-recipe-homeschooling-sa": "recipe-paptert.jpg",
};

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

const items = posts.map((post) => ({
  title: decode(post.title.rendered),
  url: customFiles[post.slug] || `${post.slug}.html`,
  category: "Cooking & Bonding",
  excerpt: crop(post.excerpt.rendered),
  author: decode(post._embedded?.author?.[0]?.name || post.yoast_head_json?.author || "SA Homeschooling"),
  image: `images/${imageMap[post.slug] || "recipe-french-toast.jpg"}`,
}));

fs.writeFileSync(
  path.join(dataDir, "cooking-posts.json"),
  `${JSON.stringify(items, null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${items.length} Cooking & Bonding data items.`);
