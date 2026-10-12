# SA Homeschooling Project

This repository contains the SA Homeschooling & Beyond public website rebuild.

The active application is the Next.js project in:

```text
frontend-next/
```

WordPress remains the editorial CMS. Editors publish posts, images, categories, authors, and other content in WordPress. The Next.js site reads public content from the WordPress REST API and renders the live website.

## Quick Start

```bash
cd frontend-next
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```
''' live link
https://new.sahomeschooling.com
'''

## Documentation

- [Frontend README](frontend-next/README.md) - developer setup, commands, deployment notes, and route overview.
- [Architecture](frontend-next/docs/architecture.md) - system architecture, data flow, runtime behavior, and maintenance notes.
- [Site Documentation](frontend-next/docs/site-documentation.md) - business/editorial handoff and publishing workflow.
- [WordPress Webhook](frontend-next/docs/wordpress-vercel-webhook.md) - optional webhook setup for faster revalidation.

## Repository Layout

```text
.
|-- frontend-next/          Active Next.js website
|-- scripts/                Migration and data helper scripts
|-- *-all-posts.json        WordPress export/source data used during migration
|-- remaining-wordpress-posts.json
|-- frontend-next.zip       Archive artifact, not source
```

Older `frontend/`, `backend/`, and `database/` folders are not part of the active application if they appear in an old checkout or archive. The live website no longer depends on that older static frontend, backend scaffold, or database schema.

## Production Summary

Deploy `frontend-next/` as the website application.

Required production commands:

```bash
npm install
npm run build
npm start
```

Important environment variables:

```text
NEXT_PUBLIC_WP_API_URL=https://sahomeschooling.com/wp-json
NEXT_PUBLIC_SITE_URL=https://sahomeschooling.com
NEXT_PUBLIC_GOOGLE_AD_NETWORK_CODE=23298734611
WORDPRESS_WEBHOOK_SECRET=choose-a-secure-secret
VERCEL_DEPLOY_HOOK_URL=
```

`VERCEL_DEPLOY_HOOK_URL` is optional unless Vercel deploy hooks are being used.
