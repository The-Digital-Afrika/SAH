const fs = require("fs");
const path = require("path");

const posts = require("../education-all-posts.json");
const dataDir = path.resolve(__dirname, "../frontend/data");

const customFiles = {
  "preparing-for-june-matric-exams-homeschooling": "hidden-value-matric-exams.html",
  "homeschooling-in-south-africa-eduxplore-2026": "eduxplore-2026.html",
  "online-school-to-tertiary-education-guide": "online-school-higher-education.html",
  "online-schools-in-south-africa-prices-subjects": "online-schools-south-africa.html",
  "maths-vs-maths-literacy-guide": "maths-vs-maths-literacy.html",
  "homeschooling-for-beginners-south-africa-faq": "homeschooling-for-beginners.html",
  "options-after-matric-south-africa-homeschoolers": "options-after-matric.html",
  "foundations-for-academic-success-south-africa": "academic-building-blocks.html",
  "microlearning-strategies-students-south-africa": "microlearning-strategies.html",
  "holistic-school-readiness-sa-parent-guide": "big-school-confidence.html",
  "boost-childs-academic-performance-homeschooling": "nurture-love-learning.html",
  "ai-education-technology-africa-bridging-gaps": "digital-wings-ai-education.html",
  "matric-prelim-exams-importance-sa-university": "nervous-during-prelims.html",
};

const images = [
  "photo-classroom.jpg",
  "photo-studying.jpg",
  "photo-library.jpg",
  "photo-learning-materials.jpg",
  "photo-homeschool-success.png",
  "photo-homeschool-family-table.png",
  "photo-desk-supplies.jpg",
  "photo-online-learning-family.png",
  "photo-passion-learning-tools.png",
  "photo-tutor.jpg",
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
  category: "Education",
  excerpt: crop(post.excerpt.rendered),
  author: decode(post._embedded?.author?.[0]?.name || post.yoast_head_json?.author || "SA Homeschooling"),
  image: `images/${images[index % images.length]}`,
}));

fs.writeFileSync(
  path.join(dataDir, "education-posts.json"),
  `${JSON.stringify(items, null, 2)}\n`,
  "utf8",
);

console.log(`Wrote ${items.length} Education data items.`);
