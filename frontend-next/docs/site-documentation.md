# SA Homeschooling Next.js Site Documentation

## Overview

The SA Homeschooling website is now a headless WordPress and Next.js application.

WordPress remains the content management system. Editors and writers still log into WordPress, write articles, upload images, choose categories, and click Publish. The public website is built with Next.js, TypeScript, and Tailwind CSS, using the WordPress REST API as the data source.

This means the editorial team does not need VS Code, Git, or developer help to publish normal article content.

## Main Publishing Workflow

1. A writer logs into WordPress.
2. They create or edit a post.
3. They add the title, featured image, author, category, and article content.
4. They click Publish.
5. The Next.js website fetches the article from the WordPress REST API.
6. The article appears on the live website after the cache refreshes or after the WordPress webhook runs.

## What The Site Uses

- Frontend framework: Next.js App Router
- Language: TypeScript
- Styling: Tailwind CSS plus migrated CSS from the original HTML design
- CMS: WordPress
- Data source: WordPress REST API
- Production server: Node.js using `server.js`
- Hosting target: Hostinger Node.js application

## Important Project Folder

The live website app is inside:

```text
frontend-next/
```

This is the folder that should be deployed to Hostinger.

The older folders at the root are not required for the live Next.js deployment:

- `frontend/` is the old static HTML design reference.
- `backend/` is an older backend scaffold and is not used by the Next.js site.
- `database/` is not needed by the live frontend because WordPress manages its own database.
- `.agents/` is not part of the website.
- `scripts/` contains helper or migration scripts and should not be deployed as the public app.

## Main Routes

The site currently supports these public pages:

```text
/                       Homepage
/articles               Article listing page
/articles/[slug]        Dynamic article page from WordPress
/category/[slug]        Dynamic category archive page
/authors                Author listing page
/authors/[slug]         Dynamic author profile page
/magazines              Magazine listing page
/magazines/embed/[slug] Magazine flipbook/embed view
/directory              Partners page
/directory/[slug]       Partner detail page
/subscribe              Subscribe page
```

## Main Components

The site has been broken into reusable components:

```text
components/Header.tsx
components/Footer.tsx
components/Hero.tsx
components/ArticleCard.tsx
components/FeaturedPosts.tsx
components/NewsletterForm.tsx
components/CategorySection.tsx
components/MagazineCard.tsx
components/MagazineViewer.tsx
components/AdSlot.tsx
components/AdBanner.tsx
components/AuthorAvatar.tsx
```

These components keep the design consistent and make future changes easier.

## WordPress Integration

WordPress API functions live in:

```text
lib/wordpress.ts
```

This file contains reusable functions for:

- Fetching posts
- Fetching a single post by slug
- Fetching categories
- Fetching posts by category
- Fetching authors
- Fetching posts by author
- Fetching magazine data
- Fetching ad placements

The app reads WordPress data from:

```text
NEXT_PUBLIC_WP_API_URL
```

Example:

```text
NEXT_PUBLIC_WP_API_URL=https://cms.homeandschool.co.za/wp-json
```

## Caching And Revalidation

The WordPress API fetches use ISR-style caching with a revalidation time of:

```text
3600 seconds
```

That means cached WordPress data can refresh roughly every hour.

There is also a WordPress webhook endpoint:

```text
/api/wordpress/deploy
```

When configured, WordPress can call this endpoint after a post is published. The endpoint revalidates key pages such as:

- Homepage
- Articles page
- Directory page
- The article page for the published slug
- Related category pages if category slugs are included

The webhook uses:

```text
WORDPRESS_WEBHOOK_SECRET
```

Optional Vercel deploy hook support also exists through:

```text
VERCEL_DEPLOY_HOOK_URL
```

For Hostinger, the site can still run without Vercel, but a WordPress webhook or cache refresh process is useful for near-instant updates.

## Environment Variables

Create these variables on the live server:

```text
NEXT_PUBLIC_WP_API_URL=https://cms.homeandschool.co.za/wp-json
NEXT_PUBLIC_SITE_URL=https://homeandschool.co.za
NEXT_PUBLIC_GOOGLE_AD_NETWORK_CODE=23298734611
WORDPRESS_WEBHOOK_SECRET=choose-a-secure-secret
VERCEL_DEPLOY_HOOK_URL=
```

`VERCEL_DEPLOY_HOOK_URL` can be left blank if Vercel is not being used.

## Hostinger Deployment

The app is designed to run as a Node.js app on Hostinger.

Deployment folder:

```text
frontend-next/
```

Install dependencies:

```bash
npm install
```

Build the production app:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

The start script runs:

```bash
node server.js
```

The server respects Hostinger's port:

```text
process.env.PORT
```

If running locally and the terminal says:

```text
Ready on http://0.0.0.0:3000
```

open this in the browser instead:

```text
http://localhost:3000
```

## Design

The Next.js frontend was built from the existing HTML/CSS design reference. The goal is not to redesign the website, but to preserve the existing visual identity while making the site easier to maintain.

Preserved design areas include:

- Pink header/navigation styling
- Editorial homepage layout
- Category story sections
- Article cards
- Newsletter forms
- Magazine area
- Partners/directory pages
- Advertisement placements
- Responsive mobile layouts

## Articles

Article pages are dynamic.

For each article, the site fetches from WordPress by slug and displays:

- Title
- Featured image
- Author
- Publish date
- Article content
- Related posts
- Newsletter signup
- SEO metadata

Author names link to author profile pages when author data is available.

## Categories

Category pages are dynamic.

The site fetches posts from WordPress by category slug and displays them as article cards.

Main editorial categories include:

- Education
- Parenting
- Development
- Ask Dalena
- Cooking & Bonding

## Authors

The app supports author profiles from WordPress users.

Author pages can show:

- Author name
- Avatar
- Bio
- Published articles

If data is missing, the page shows safe fallback text instead of breaking.

## Magazines

The magazines page supports magazine issue listings and DFlip-style viewing where data is available.

The app attempts to use real WordPress magazine data, including:

- Cover image
- Issue title
- Issue number
- PDF link
- Embed link or viewer

If the DFlip shortcode cannot run inside Next.js, the app falls back to a safe PDF/embed viewer.

## Partners

The old Directory area is now presented as Partners.

Partner pages can include:

- Partner logo/image
- Description
- Website link
- Additional information
- Contact form layout
- Advertisement/newsletter sidebar

The navigation label is "Partners", but the route remains:

```text
/directory
```

## Ads

Ad components are reusable and placement-based.

The site is wired to Google Publisher Tag ads using the same public Newspack/Google network code found on the WordPress site:

```text
23298734611
```

Marketing can continue managing campaigns in Google/Newspack. The Next.js site provides the ad slots and requests the Google ads on the live page. The public frontend serves `/ads.txt` by checking the CMS first, then the legacy WordPress domain during migration.

Supported placement names include:

```text
home-top
home-middle
home-bottom
article-top
article-inline
article-sidebar
category-top
magazine-top
directory-top
subscribe-bottom
```

If live ad data is not available from WordPress yet, the app shows safe placeholder-style ad blocks that match the current design.

Current visible ad areas:

- Homepage: top banner above navigation, banner after top stories, banners between homepage category sections, and a bottom banner before the footer.
- Education articles page: top banner and bottom wide banner.
- Category pages: top banner, sidebar rectangle ad, and bottom wide banner.
- Tag pages: top banner, sidebar rectangle ad, and bottom wide banner.
- Article pages: top banner, inline article ad, and sidebar ads.
- Magazines page: magazine page banner above the magazine grid.
- Partners page: sidebar ad beside the partner listings.
- Partner detail pages: sidebar ad beside partner details plus a bottom wide banner.
- Authors pages: top banner and bottom wide banner.
- Subscribe page: bottom newsletter banner.

## SEO

The site uses the Next.js Metadata API.

SEO support includes:

- Default site metadata
- Dynamic article titles
- Dynamic category titles
- Dynamic author titles
- Dynamic partner titles
- Open Graph metadata
- Canonical URLs
- Site favicon and Apple icon

## Error Handling

The WordPress API functions are protected with safe error handling.

If WordPress is slow or unavailable during build or deployment:

- The build should not crash.
- The page renders an empty state where needed.
- A warning is logged in the console.
- Real WordPress data returns again once the API is available.

This is important for Hostinger deployment, because build servers can sometimes fail if an external API times out.

## Local Development

From the project folder:

```bash
cd frontend-next
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

If Turbopack cache causes issues during development, stop the dev server, delete the generated `.next` folder, and run the dev server again.

The `.next` folder is generated by Next.js and should not be committed to Git.

## Build Checks

Before deployment, run:

```bash
npm run lint
npm run build
```

Both should pass before uploading or deploying.

## What The Boss Should Know

The important business outcome is:

Editors can keep using WordPress as normal.

They can:

1. Log into WordPress.
2. Write an article.
3. Add a featured image and category.
4. Click Publish.
5. See the article appear on the live Next.js website automatically after refresh/revalidation.

No coding, VS Code, or Git is required for normal publishing.

## Recommended Next Steps

Before launch:

1. Deploy only `frontend-next/` to Hostinger.
2. Add the production environment variables.
3. Run `npm install`.
4. Run `npm run build`.
5. Start the app with `npm start`.
6. Test homepage, articles, categories, magazines, partners, and subscribe pages.
7. Confirm WordPress publishing updates appear on the live site.
8. Configure a WordPress webhook for faster post updates if required.
