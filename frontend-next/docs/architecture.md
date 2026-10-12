# SA Homeschooling Architecture

## Purpose

SA Homeschooling & Beyond is a public editorial website for South African homeschooling families. The project has been migrated from older static/backend scaffolding into a headless WordPress and Next.js architecture.

The core goal is simple:

Editors keep publishing in WordPress, and the Next.js site renders a faster, maintainable public website from that content.

## High-Level Architecture

```text
Editors
  |
  v
WordPress CMS
  |  public REST API
  v
Next.js app in frontend-next/
  |-- Server components fetch and render WordPress content
  |-- Client components handle menus, search overlay, signup UI, and ads
  |-- Local fallbacks protect the site if WordPress is unavailable
  v
Visitors
```

Optional webhook flow:

```text
WordPress publish event
  |
  v
POST /api/wordpress/deploy
  |
  |-- validates WORDPRESS_WEBHOOK_SECRET
  |-- revalidates important paths
  |-- optionally calls VERCEL_DEPLOY_HOOK_URL
  v
Fresh content appears sooner
```

## Runtime Stack

- Framework: Next.js 16 App Router
- UI runtime: React 19
- Language: TypeScript
- Styling: Tailwind CSS 4 plus site-specific global CSS in `app/globals.css`
- CMS: WordPress through REST API
- Ads: Google Publisher Tag through `components/GoogleAdUnit.tsx`
- Hosting shape: Node.js app started by `server.js`
- Package manager: npm with `package-lock.json`

## Application Boundary

The live website source is:

```text
frontend-next/
```

The root-level JSON exports and `scripts/` folder are migration/support artifacts. They are useful for content migration and validation, but they are not part of the public runtime app.

The old `frontend/`, `backend/`, and `database/` areas are not required by the active Next.js site.

## Directory Responsibilities

```text
frontend-next/
|-- app/                  Routes, layouts, pages, and API endpoints
|-- components/           Reusable UI components
|-- data/                 Local JSON fallback data
|-- docs/                 Project documentation
|-- lib/                  Data access and domain helpers
|-- public/               Static images, magazine PDFs, magazine covers, icons
|-- server.js             Custom production server
|-- next.config.ts        Next.js image/Turbopack configuration
|-- package.json          Scripts and dependencies
```

## Route Architecture

The project uses the Next.js App Router. Most pages are async server components that fetch content before rendering.

```text
app/layout.tsx
```

Defines global metadata, favicon/apple icon settings, the HTML shell, and mounts `SignupPopup` globally.

```text
app/page.tsx
```

Homepage. Fetches latest posts, local magazine issues, and category sections in parallel.

```text
app/articles/page.tsx
```

Education archive. Fetches the education category and paginated education posts.

```text
app/articles/[slug]/page.tsx
```

Article detail page. Fetches a WordPress post by slug, generates dynamic SEO metadata, renders article HTML, author data, related posts, newsletter UI, and ad slots.

```text
app/category/[slug]/page.tsx
app/tag/[slug]/page.tsx
```

Dynamic archive pages for WordPress categories and tags.

```text
app/authors/page.tsx
app/authors/[slug]/page.tsx
```

WordPress author listing and author profile pages.

```text
app/magazines/page.tsx
app/magazines/embed/[slug]/page.tsx
```

Magazine library and DFlip/PDF viewer page.

```text
app/directory/page.tsx
app/directory/[slug]/page.tsx
```

Partner directory backed by local static data in `lib/partners.ts`.

```text
app/subscribe/page.tsx
```

Newsletter signup page. The current implementation acknowledges signups in-browser only.

## API Routes

### `/api/wordpress/deploy`

File:

```text
app/api/wordpress/deploy/route.ts
```

Purpose:

- Accepts a WordPress publish webhook.
- Requires `WORDPRESS_WEBHOOK_SECRET` through header `x-wordpress-webhook-secret` or query string `secret`.
- Ignores non-published statuses when present.
- Revalidates static paths like `/`, `/articles`, and `/directory`.
- Revalidates `/articles/[slug]` when a slug is sent.
- Revalidates `/category/[slug]` for category slugs included in the payload.
- Optionally calls `VERCEL_DEPLOY_HOOK_URL`.

### `/api/magazine-pdf`

File:

```text
app/api/magazine-pdf/route.ts
```

Purpose:

- Proxies magazine PDFs from allowed hosts only.
- Allows `sahomeschooling.com` and `www.sahomeschooling.com`.
- Rejects non-PDF URLs and untrusted hosts.
- Caches successful PDF responses for one hour.

This exists so the DFlip viewer can load remote WordPress-hosted PDF files through the Next.js app.

## Data Layer

The central data module is:

```text
lib/wordpress.ts
```

It provides:

- WordPress type definitions for posts, pages, authors, categories, tags, media, ads, and magazines.
- WordPress REST helpers.
- Public fetch functions used by pages.
- Fallback posts, categories, author data, ads, and magazine issues.
- Formatting helpers for titles, excerpts, dates, featured images, authors, categories, and tags.
- Magazine parsing and utility helpers.

Primary exported fetch functions:

```text
getPosts
getPaginatedPosts
getPostBySlug
getCategories
getCategoryBySlug
getPostsByCategory
getTags
getTagBySlug
getPostsByTag
getAuthors
getAuthorBySlug
getPostsByAuthor
getMagazinePosts
getMagazineBySlug
getAds
getAdByPlacement
```

## WordPress Integration

The WordPress API base URL comes from:

```text
NEXT_PUBLIC_WP_API_URL
```

Default:

```text
https://sahomeschooling.com/wp-json
```

The app reads from these WordPress REST areas:

```text
/wp/v2/posts
/wp/v2/categories
/wp/v2/tags
/wp/v2/users
/wp/v2/pages
/wp/v2/newspack_ad_codes
```

Most WordPress requests include `_embed=1` where embedded author, featured media, categories, and tags are needed.

## Caching And Resilience

WordPress fetches use a one-hour revalidation window:

```text
3600 seconds
```

The data layer is designed to fail soft:

- If WordPress requests fail, page rendering falls back to local fallback content where available.
- Build/deploy should not fail only because WordPress is temporarily unavailable.
- Errors are logged with context, but pages render empty states or fallback data.

Fallback content comes from:

```text
data/wp-fallback-posts.json
```

and fallback structures inside:

```text
lib/wordpress.ts
```

## Content Ownership

### WordPress-Owned

- Posts
- Post HTML content
- Featured images
- Categories
- Tags
- Authors
- Author avatars and bios when available
- Newspack/WordPress ad code records when available

### Next.js-Owned

- Public page layouts
- Navigation
- Partner directory content
- Magazine issue curation
- Local magazine PDFs and cover images
- Fallback content
- Ad slot placement and rendering wrappers
- Newsletter/signup UI behavior
- SEO metadata templates

## Magazine Architecture

Magazines are exposed through:

```text
getMagazinePosts()
getMagazineBySlug()
```

Current magazine data is curated locally in `lib/wordpress.ts` using:

- `localMagazineOrder`
- `localMagazineCovers`
- `localMagazineDescriptions`
- `localMagazinePdfUrls`

Static assets live in:

```text
public/magazines/
public/magazine-covers/
```

Viewer behavior:

- `/magazines` lists issues with `MagazineCard`.
- `MagazineViewer` links each issue to an embed/PDF view.
- `/magazines/embed/[slug]` loads DFlip assets from WordPress plugin URLs.
- Remote PDFs pass through `/api/magazine-pdf` when needed.

## Partner Directory Architecture

Partners are local static records in:

```text
lib/partners.ts
```

Each partner can include:

- Slug
- Logo
- Name
- Short description
- Detail page headings and copy
- More information links
- Contact details
- Website URL

Dynamic partner detail pages are generated from this static array.

To add a partner:

1. Add logo/image assets to `public/images/`.
2. Add a new record in `lib/partners.ts`.
3. Visit `/directory` and `/directory/[slug]`.
4. Run `npm run lint` and `npm run build`.

## Component Architecture

Shared page chrome:

```text
components/Header.tsx
components/Footer.tsx
```

Editorial display:

```text
components/FeaturedMosaic.tsx
components/ArticleCard.tsx
components/CategorySection.tsx
components/FeaturedPosts.tsx
components/Hero.tsx
components/ReadMoreText.tsx
```

Ads:

```text
components/AdBanner.tsx
components/AdSlot.tsx
components/GoogleAdUnit.tsx
```

Newsletter/signup:

```text
components/NewsletterForm.tsx
components/SignupPopup.tsx
components/NewsletterAdStack.tsx
```

Magazines:

```text
components/MagazineCard.tsx
components/MagazineViewer.tsx
```

Supporting content:

```text
components/AuthorAvatar.tsx
components/ResourceCards.tsx
```

Server/client split:

- Most pages and data-fetching components are server-rendered.
- `Header` is a client component because it controls mobile menu/search state.
- `GoogleAdUnit` is a client component because GPT runs in the browser.
- `NewsletterForm` and `SignupPopup` are client components because they use browser storage and form state.
- `ReadMoreText` is a client component because it measures rendered content.

## Ads Architecture

Ads flow through:

```text
Page -> AdBanner/AdSlot -> getAdByPlacement -> GoogleAdUnit
```

The data layer defines ad placements and fallback Google slot configuration. WordPress/Newspack ad code records can override fallback HTML when a matching placement is resolved.

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

Google Publisher Tag is loaded in the browser by `GoogleAdUnit`. The component:

- Creates a unique slot id.
- Loads `https://securepubads.g.doubleclick.net/tag/js/gpt.js`.
- Defines responsive slot sizes.
- Enables single request mode.
- Collapses empty divs.
- Marks slots as pending, loaded, or empty for styling.

## Newsletter And Forms

Current behavior:

- `NewsletterForm` prevents default submission, stores a browser localStorage flag, and shows a thank-you message.
- `SignupPopup` appears after a delay unless the visitor has signed up or has already seen it on the current path during the session.
- Partner detail contact forms use `mailto:` when a partner email exists.

There is no backend newsletter submission endpoint in the current app.

To connect a real mailing list later, add a server route such as:

```text
app/api/newsletter/route.ts
```

Then update `NewsletterForm` and `SignupPopup` to submit to that endpoint.

## SEO

SEO uses the Next.js Metadata API.

Global defaults live in:

```text
app/layout.tsx
```

Dynamic metadata is generated for:

- Articles
- Categories
- Tags
- Authors
- Partner detail pages

Metadata includes titles, descriptions, canonical paths, Open Graph basics, and article-specific image/time metadata where available.

## Image Handling

`next.config.ts` allows remote images from:

```text
sahomeschooling.com
www.sahomeschooling.com
secure.gravatar.com
```

Local images live in:

```text
public/images/
public/magazine-covers/
```

Article featured images use WordPress embedded media when available and fall back to local placeholder imagery.

## Styling Architecture

Global styling lives in:

```text
app/globals.css
```

The project imports Tailwind CSS at the top of this file, then uses a large set of site-specific classes migrated from the original visual design.

The main design direction is editorial, with:

- Brand pink navigation and buttons
- Image-led story cards
- Category-specific archive layouts
- Newsletter/ad sidebars
- Magazine and partner resource sections

## Production Server

Production starts through:

```text
server.js
```

It:

- Creates a Node HTTP server.
- Starts Next.js in production mode.
- Uses `process.env.PORT || 3000`.
- Uses `process.env.HOSTNAME || "0.0.0.0"`.

This is intended for hosts that run Node.js apps directly, including Hostinger-style deployments.

## Deployment Process

From `frontend-next/`:

```bash
npm install
npm run build
npm start
```

Pre-deployment checks:

```bash
npm run lint
npm run build
```

Do not deploy root-level migration JSON files unless the hosting process explicitly requires the whole repository. The application source is `frontend-next/`.

## Required Configuration

```text
NEXT_PUBLIC_WP_API_URL=https://sahomeschooling.com/wp-json
NEXT_PUBLIC_SITE_URL=https://sahomeschooling.com
NEXT_PUBLIC_GOOGLE_AD_NETWORK_CODE=23298734611
WORDPRESS_WEBHOOK_SECRET=choose-a-secure-secret
VERCEL_DEPLOY_HOOK_URL=
```

Notes:

- `NEXT_PUBLIC_SITE_URL` controls canonical metadata.
- `NEXT_PUBLIC_WP_API_URL` controls WordPress REST requests.
- `NEXT_PUBLIC_GOOGLE_AD_NETWORK_CODE` controls fallback Google ad unit paths.
- `WORDPRESS_WEBHOOK_SECRET` is required only for the webhook endpoint.
- `VERCEL_DEPLOY_HOOK_URL` can be blank unless a Vercel deploy hook is used.

## Maintenance Workflows

### Add Or Edit A WordPress Article

Do it in WordPress. No code change should be needed.

### Add A New Category

1. Create the category in WordPress.
2. Publish posts in that category.
3. Visit `/category/[wordpress-slug]`.
4. Add navigation/resource-card links only if the category should be promoted.

### Add A New Static Partner

1. Add the logo to `public/images/`.
2. Add a partner record to `lib/partners.ts`.
3. Check `/directory` and `/directory/[slug]`.
4. Run lint and build.

### Add A Magazine Issue

1. Add the PDF to `public/magazines/` or set a remote WordPress PDF URL.
2. Add the cover image to `public/magazine-covers/`.
3. Update local magazine data in `lib/wordpress.ts`.
4. Check `/magazines` and `/magazines/embed/[slug]`.
5. Run lint and build.

### Change Ad Placements

1. Add or update placement usage in page components.
2. Add a fallback entry in `lib/wordpress.ts` if the placement is new.
3. Confirm Google slot sizes in `GoogleAdUnit`.
4. Test empty and loaded ad states.

## Known Limitations

- Newsletter forms are not connected to a real mailing list or CRM.
- Header search only searches a small local list of main site destinations, not the full WordPress article corpus.
- Partner data is static and requires code changes.
- Magazine data is curated locally and requires code changes for new issues.
- WordPress HTML is rendered with `dangerouslySetInnerHTML` on article pages, so trusted WordPress editorial access remains important.

## Verification Checklist

Before handoff or deployment:

```bash
npm run lint
npm run build
```

Then manually verify:

- Homepage loads current/fallback stories.
- `/articles` paginates.
- `/articles/[slug]` renders a WordPress article.
- `/category/education`, `/category/parenting`, `/category/development`, and `/category/cooking-bonding` render.
- `/tag/[slug]` renders for a known WordPress tag.
- `/authors` and `/authors/[slug]` render.
- `/magazines` and at least one `/magazines/embed/[slug]` render.
- `/directory` and all partner detail pages render.
- Newsletter popup/form behavior works.
- Ads do not break layout when empty.
