const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const frontend = path.join(root, "frontend");
const posts = require(path.join(root, "parenting-all-posts.json"));

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

const pageMap = {
  "parenting-during-exams-south-africa-guide": {
    image: "photo-studying.jpg",
    category: "Parenting",
  },
  "homeschool-organisation-south-africa": {
    image: "photo-desk-supplies.jpg",
    category: "Parenting",
  },
  "child-online-safety-south-africa-fpb-guide": {
    image: "photo-online-learning-family.png",
    category: "Parenting",
  },
  "financial-literacy-for-kids-sa-homeschooling": {
    image: "photo-leadership-booklet.jpg",
    category: "Parenting",
  },
  "parenting-a-child-with-adhd-donts": {
    image: "photo-homeschool-family-table.png",
    category: "Parenting",
  },
  "madeleine-asks-how-can-i-best-support-my-son-with-dyslexia": {
    image: "photo-tutor.jpg",
    category: "Ask Dalena, Parenting",
  },
  "adult-concentration-focus-homeschool-parents": {
    image: "photo-library.jpg",
    category: "Ask Dalena, Parenting",
  },
  "homeschooling-child-with-autism-sa-guide": {
    image: "photo-homeschool-success.png",
    category: "Parenting",
  },
};

const fallbackImages = [
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

const latestLinks = [
  ["The Hidden Value in the Mid-Year Matric Exams", "hidden-value-matric-exams.html"],
  ["Everything You Need to Know About EduXplore This Year", "eduxplore-2026.html"],
  ["Going from Online School to Higher Education: What You Need to Know", "online-school-higher-education.html"],
  ["Maths Vs Maths Literacy: How to Choose Strength Over Comfort", "maths-vs-maths-literacy.html"],
  ["Parenting During Exams: How to Push Without Burning Them Out", "parenting-during-exams-south-africa-guide.html"],
];

function decode(value = "") {
  return value
    .replace(/\u2018/g, "'")
    .replace(/\u2019/g, "'")
    .replace(/\u201c/g, "\"")
    .replace(/\u201d/g, "\"")
    .replace(/\u2013/g, "-")
    .replace(/\u2014/g, "-")
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, "\"")
    .replace(/&#8221;/g, "\"")
    .replace(/&#038;/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&ndash;/g, "-")
    .replace(/&mdash;/g, "-");
}

function stripTags(value = "") {
  return decode(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function cleanContent(html = "") {
  return decode(html)
    .replace(/<p class="wp-block-paragraph">\s*<\/p>/g, "")
    .replace(/<h2 class="wp-block-heading">\s*(?:<strong>)?\s*(?:<\/strong>)?\s*<\/h2>/g, "")
    .replace(/\sclass="[^"]*"/g, "")
    .replace(/\sstyle="[^"]*"/g, "")
    .replace(/<figure[\s\S]*?<\/figure>/g, "")
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/g, "")
    .replace(/<div[^>]*google[^>]*>[\s\S]*?<\/div>/gi, "")
    .replace(/https:\/\/sahomeschooling\.com\/subscribe\/?/g, "subscribe.html")
    .replace(/http:\/\/sahomeschooling\.com\/subscribe\/?/g, "subscribe.html")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatDate(isoDate) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

function getAuthor(post) {
  return decode(post._embedded?.author?.[0]?.name || post.yoast_head_json?.author || "SA Homeschooling");
}

function getFile(post) {
  return customFiles[post.slug] || `${post.slug}.html`;
}

function getConfig(post, index) {
  return {
    file: getFile(post),
    image: pageMap[post.slug]?.image || fallbackImages[index % fallbackImages.length],
    category: pageMap[post.slug]?.category || "Parenting",
  };
}

function header() {
  return `
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="index.html" aria-label="SA Homeschooling home">
        <span class="brand-small">sa</span>
        <span class="brand-home">Home</span><span class="brand-school">schooling</span>
      </a>
      <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false">Menu</button>
      <nav class="site-nav" aria-label="Main navigation">
        <a href="index.html">Home</a>
        <a href="articles.html">Education</a>
        <div class="nav-dropdown">
          <a class="nav-parent" href="development.html">Development</a>
          <div class="nav-dropdown-menu">
            <a href="ask-dalena.html">Ask Dalena</a>
          </div>
        </div>
        <div class="nav-dropdown">
          <a class="nav-parent active" href="parenting.html">Parenting</a>
          <div class="nav-dropdown-menu">
            <a href="parenting.html">Parenting</a>
            <a href="cooking-bonding.html">Cooking &amp; Bonding</a>
          </div>
        </div>
        <a href="about.html">Directory</a>
        <a href="podcasts.html">Magazines</a>
        <a href="subscribe.html">Subscribe</a>
        <button class="search-link" type="button" aria-label="Search">Search</button>
      </nav>
    </div>
  </header>`;
}

function footer() {
  return `
  <footer class="home-footer">
    <div class="footer-columns">
      <section>
        <h2>Our Office</h2>
        <p>Tshimologong Digital Precinct, 41 Juta Street,<br>Braamfontein, Johannesburg, South Africa</p>
      </section>
      <section>
        <h2>Useful Links</h2>
        <a href="#">Advertise</a>
        <a href="podcasts.html">Magazines</a>
        <a href="about.html">About Us</a>
        <a href="contact.html">Contact Us</a>
        <a href="#">Privacy Policy for SA Homeschooling &amp; Beyond</a>
        <a href="subscribe.html">Subscribe</a>
      </section>
      <section>
        <h2>Follow Us</h2>
        <div class="social-links">
          <a href="#" aria-label="Facebook">f</a>
          <a href="#" aria-label="Instagram">ig</a>
          <a href="#" aria-label="LinkedIn">in</a>
          <a href="#" aria-label="X">x</a>
        </div>
      </section>
    </div>
    <div class="footer-bottom">
      <span>&copy; 2025 The Digital Afrikan &nbsp; Powered by Newspack</span>
      <a href="#">Privacy Policy for SA Homeschooling &amp; Beyond</a>
    </div>
  </footer>`;
}

function articlePage(post, config) {
  const title = decode(post.title.rendered);
  const author = getAuthor(post);
  const date = formatDate(post.date);
  const excerpt = stripTags(post.excerpt.rendered);
  const body = cleanContent(post.content.rendered);
  const inputPrefix = post.slug.replace(/[^a-z0-9]+/g, "-").slice(0, 28);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | SA Homeschooling &amp; Beyond</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body class="recipe-page article-page">
${header()}

  <section class="recipe-hero article-hero">
    <img src="images/${config.image}" alt="">
    <div class="recipe-hero-overlay">
      <div class="section-rule"></div>
      <p>${config.category}</p>
      <h1>${title}</h1>
      <span>by <a href="#">${author}</a> &nbsp;&nbsp; ${date}</span>
    </div>
  </section>

  <main class="recipe-layout article-layout">
    <article class="recipe-article article-body">
      <div class="intro-box">
        <p>${excerpt}</p>
      </div>

      ${body}

      <div class="article-ad-slot google-ad-slot google-ad-slot--leaderboard" aria-label="Advertisement"></div>

      <section class="author-bio">
        <div class="author-avatar" aria-hidden="true"></div>
        <div>
          <h2>${author}</h2>
          <p>${author} contributes practical guidance and stories for South African homeschooling families navigating education, parenting, and everyday learning.</p>
          <a href="#">More by ${author}</a>
        </div>
      </section>

      <nav class="post-navigation" aria-label="Post navigation">
        <a href="parenting.html">
          <span>Back to</span>
          Parenting
        </a>
        <a href="cooking-bonding.html">
          <span>Explore</span>
          Cooking &amp; Bonding
        </a>
      </nav>

      <section class="comment-section" aria-labelledby="${inputPrefix}-comment-title">
        <h2 id="${inputPrefix}-comment-title">Leave a comment</h2>
        <form class="comment-form">
          <label for="${inputPrefix}-comment">Comment *</label>
          <textarea id="${inputPrefix}-comment" rows="8"></textarea>
          <label class="checkbox-row">
            <input type="checkbox">
            <span>Sign me up for the newsletter!</span>
          </label>
          <button class="signup-button" type="submit">Post Comment</button>
        </form>
      </section>
    </article>

    <aside class="recipe-sidebar article-sidebar">
      <div class="article-side-ad google-ad-slot google-ad-slot--medium-rect" aria-label="Advertisement"></div>
      <section class="latest-widget">
        <h2>Latest Stories</h2>
        ${latestLinks.map(([label, href]) => `<a href="${href}">${label}</a>`).join("\n        ")}
      </section>
      <form class="sidebar-newsletter labeled">
        <div class="section-rule"></div>
        <h2>Newsletter</h2>
        <label for="${inputPrefix}-name">Name</label>
        <input id="${inputPrefix}-name" type="text" placeholder="Name">
        <label for="${inputPrefix}-last-name">Last name</label>
        <input id="${inputPrefix}-last-name" type="text" placeholder="Last name">
        <label for="${inputPrefix}-email">Email address:</label>
        <input id="${inputPrefix}-email" type="email" placeholder="Your email address">
        <button class="signup-button" type="submit">Sign up</button>
      </form>
      <div class="article-side-ad google-ad-slot google-ad-slot--medium-rect" aria-label="Advertisement"></div>
    </aside>
  </main>

${footer()}

  <script src="js/main.js"></script>
</body>
</html>
`;
}

let created = 0;
let skipped = 0;

for (const [index, post] of posts.entries()) {
  const config = getConfig(post, index);
  if (customFiles[post.slug]) {
    skipped += 1;
    continue;
  }

  const target = path.join(frontend, config.file);
  fs.writeFileSync(target, articlePage(post, config), "utf8");
  created += 1;
  console.log(`created ${path.relative(root, target)}`);
}

console.log(`Done. Created ${created} Parenting pages. Skipped ${skipped} mapped custom pages.`);
