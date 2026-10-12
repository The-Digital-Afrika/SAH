const fs = require("fs");
const path = require("path");

const posts = require("../remaining-wordpress-posts.json");
const dataDir = path.resolve(__dirname, "../frontend/data");

const images = [
  "photo-online-learning-family.png",
  "photo-homeschool-family-table.png",
  "photo-studying.jpg",
  "photo-library.jpg",
  "photo-learning-materials.jpg",
  "photo-homeschool-success.png",
  "photo-desk-supplies.jpg",
];

function decode(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\u00a0/g, " ")
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
  url: `${post.slug}.html`,
  category: post.categories.includes(97) ? "Partner" : "SA Homeschooling",
  excerpt: crop(post.excerpt.rendered),
  author: decode(post._embedded?.author?.[0]?.name || post.yoast_head_json?.author || "SA Homeschooling"),
  image: `images/${images[index % images.length]}`,
}));

fs.writeFileSync(
  path.join(dataDir, "remaining-posts.json"),
  `${JSON.stringify(items, null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${items.length} remaining data items.`);
