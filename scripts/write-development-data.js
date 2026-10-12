const fs = require("fs");
const path = require("path");

const posts = require("../development-all-posts.json");
const dataDir = path.resolve(__dirname, "../frontend/data");

const imageMap = {
  "financial-literacy-for-youth-south-africa-guide": "photo-leadership-booklet.jpg",
  "data-management-careers-south-africa-guide": "photo-leadership-booklet.jpg",
  "classic-books-for-kids-homeschool-list": "photo-library.jpg",
  "technology-for-self-directed-learning-sa": "photo-online-learning-family.png",
  "parenting-a-child-with-adhd-donts": "photo-homeschool-family-table.png",
  "madeleine-asks-how-can-i-best-support-my-son-with-dyslexia": "photo-tutor.jpg",
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
  category: "Development",
  excerpt: crop(post.excerpt.rendered),
  author: decode(post._embedded?.author?.[0]?.name || post.yoast_head_json?.author || "SA Homeschooling"),
  image: `images/${imageMap[post.slug] || images[index % images.length]}`,
}));

fs.writeFileSync(
  path.join(dataDir, "development-posts.json"),
  `${JSON.stringify(items, null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${items.length} Development data items.`);
