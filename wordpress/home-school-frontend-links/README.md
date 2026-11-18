# Home & School published post links

This independent WordPress plugin changes published post permalinks and Preview links to the configured frontend. It survives theme changes. No destination is active until configured.

## Install

1. Zip the `home-school-frontend-links` folder (the PHP file must remain inside that folder).
2. In the CMS, open Plugins > Add New Plugin > Upload Plugin, select the ZIP, install and activate.
3. Open Settings > General and set **Home & School frontend URL** to the agreed public HTTPS address. Do not change WordPress Address or Site Address.
4. Save, then use View Post on a published article. Confirm its category and slug match the new frontend route.
5. Verify Education, Parenting and a post with multiple categories. The frontend redirects any alternate category path to the canonical path.

Published Preview links show the last published version, not unsaved edits. Drafts, pending posts, scheduled posts, private posts and password-protected posts keep their WordPress links. Secure frontend draft previews are a separate feature.

To revert, clear the frontend URL or deactivate this plugin. No article content or theme settings are changed. The existing theme is intentionally retained until the separate theme task.

PHP syntax and a WordPress integration check are required before production activation; PHP is not installed in this local workspace.

References: https://developer.wordpress.org/reference/hooks/post_link/ and https://developer.wordpress.org/reference/hooks/preview_post_link/
