# Magazine articles from SA Homeschooling

`data/legacy-magazine-posts.json` contains a read-only snapshot of public magazine announcements from the existing SA Homeschooling site, including September and October 2026. The editorial article, author, category, cover and original PDF URL are retained. This does not create or modify posts in the CMS.

The frontend adds only issues missing from the CMS. Native CMS posts take precedence by slug, so editors can migrate an issue into WordPress without showing it twice. Lists are sorted and paginated after merging. The magazine library and latest-magazine card use the same issue data.

Article pages replace the old DFlip shell with a PDF reader through `/api/magazine-pdf`. PDF files remain on the original site. Keep those files available until they are copied into the CMS or another permanent asset store. Imported issues do not display a CMS comment form because their post IDs may not exist in the CMS.

Refresh the snapshot from the repository root:

```powershell
node scripts/sync-magazine-posts.mjs
```

The script reads public posts and writes the local snapshot only. Run the magazine tests after refreshing:

```powershell
cd frontend-next
node --test tests/magazine-posts.test.mjs
```
