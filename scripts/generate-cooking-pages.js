const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const frontend = path.join(root, "frontend");
const posts = require(path.join(root, "cooking-bonding-all-posts.json"));

const customFiles = {
  "festive-rocky-road-recipe-no-bake": "sarah-miller-recipes.html",
  "fall-off-the-bone-oxtail-recipe": "oxtail-recipe.html",
  "twisted-french-toast-sandwich-homeschool-lunch": "french-toast-recipe.html",
  "bacon-mushroom-paptert-recipe": "paptert-recipe.html",
  "easy-smoothie-recipe-kids-banana-peanut-butter": "smoothie-recipe.html",
};

const imageMap = {
  "easy-milk-tart-recipe-south-africa": "recipe-paptert.jpg",
  "twisted-french-toast-sandwich-homeschool-lunch-2": "recipe-french-toast.jpg",
  "easy-bread-recipe-for-kids": "recipe-french-toast.jpg",
  "easy-dinner-recipes-kids-cheesy-potato-muffins": "recipe-paptert.jpg",
  "healthy-lunch-ideas-kids-tuna-mango-salad": "recipe-toast-blue.jpg",
  "cooking-with-kids-activities-biltong-muffins-recipe": "recipe-paptert.jpg",
  "pilchard-fish-cakes-recipe-budget-meals-sa": "recipe-oxtail.jpg",
  "easy-family-pasta-recipe-homeschooling-sa": "recipe-paptert.jpg",
};

const latestLinks = [
  ["Messy Hands, Happy Hearts: The Ultimate Festive Rocky Road Recipe", "sarah-miller-recipes.html"],
  ["Fall-Off-The-Bone Sunday Magic: A Rich SA Oxtail Recipe", "oxtail-recipe.html"],
  ["The \"Twisted\" French Toast Sandwich: A Fun Homeschool Lunch Idea", "french-toast-recipe.html"],
  ["Hearty Bacon and Mushroom Paptert Recipe", "paptert-recipe.html"],
  ["Blitz & Bond: The Easiest Banana Peanut Butter Smoothie Kids Can Make", "smoothie-recipe.html"],
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

function articlePage(post) {
  const title = decode(post.title.rendered);
  const author = getAuthor(post);
  const date = formatDate(post.date);
  const excerpt = stripTags(post.excerpt.rendered);
  const body = cleanContent(post.content.rendered);
  const inputPrefix = post.slug.replace(/[^a-z0-9]+/g, "-").slice(0, 28);
  const image = imageMap[post.slug] || "recipe-french-toast.jpg";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | SA Homeschooling &amp; Beyond</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body class="recipe-page">
${header()}

  <section class="recipe-hero">
    <img src="images/${image}" alt="">
    <div class="recipe-hero-overlay">
      <div class="section-rule"></div>
      <p>Cooking &amp; Bonding, Parenting</p>
      <h1>${title}</h1>
      <span>by <a href="#">${author}</a> &nbsp;&nbsp; ${date}</span>
    </div>
  </section>

  <main class="recipe-layout">
    <article class="recipe-article">
      <div class="intro-box">
        <p>${excerpt}</p>
      </div>

      ${body}

      <section class="author-bio">
        <div class="author-avatar" aria-hidden="true"></div>
        <div>
          <h2>${author}</h2>
          <p>${author} shares family-friendly recipes and ideas that help South African homeschool families make everyday learning more practical and connected.</p>
          <a href="#">More by ${author}</a>
        </div>
      </section>

      <nav class="post-navigation" aria-label="Post navigation">
        <a href="cooking-bonding.html">
          <span>Back to</span>
          Cooking &amp; Bonding
        </a>
        <a href="parenting.html">
          <span>Explore</span>
          Parenting
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

    <aside class="recipe-sidebar">
      <section class="latest-widget">
        <h2>Latest Recipes</h2>
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

for (const post of posts) {
  if (customFiles[post.slug]) {
    skipped += 1;
    continue;
  }

  const target = path.join(frontend, `${post.slug}.html`);
  fs.writeFileSync(target, articlePage(post), "utf8");
  created += 1;
  console.log(`created ${path.relative(root, target)}`);
}

console.log(`Done. Created ${created} Cooking & Bonding pages. Skipped ${skipped} mapped custom pages.`);
