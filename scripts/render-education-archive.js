const posts = require("../education-all-posts.json");

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

console.log(`    <section class="education-archive-section" aria-labelledby="education-archive-title">
      <div class="section-heading">
        <span class="kicker">Education Archive</span>
        <h2 id="education-archive-title">All Education Stories</h2>
      </div>
      <div class="education-archive-grid">`);

posts.forEach((post, index) => {
  const href = customFiles[post.slug] || `${post.slug}.html`;
  const image = images[index % images.length];
  const title = decode(post.title.rendered);
  const excerpt = crop(post.excerpt.rendered);
  const author = decode(post._embedded?.author?.[0]?.name || post.yoast_head_json?.author || "SA Homeschooling");

  console.log(`        <a class="education-archive-card" href="${href}">
          <img src="images/${image}" alt="">
          <span class="kicker">Education</span>
          <h3>${title}</h3>
          <p>${excerpt}</p>
          <strong>by ${author}</strong>
        </a>`);
});

console.log(`      </div>
    </section>`);
