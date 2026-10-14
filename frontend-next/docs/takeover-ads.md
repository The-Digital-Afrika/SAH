# Site Takeover Ads

The shared root layout owns the only above-header ad position on every page.
Page gutters use the matching campaign gradient. Existing in-content and sidebar
ads are unchanged. No magazine advert is used as a takeover fallback.

The desktop content frame is capped at 1152px so the coloured gutters are visible
at normal browser zoom. At viewport widths of 1400px and above, the outer gutter
ads use the same supplied banner, or side artwork explicitly matched to the
currently rendered top Google campaign. Until campaign artwork is available,
both sides use the requested temporary EduXplore placeholder. Side artwork is
hidden on smaller screens and does not replace in-content sidebar ads.

## Configuration

Add a structured `takeover` field to the `home-top` WordPress ad code, exposed
through `acf.takeover` or `meta.takeover` in the WordPress REST API. Alternatively,
set the server-only `SITE_TAKEOVER_CONFIG` environment variable to the same JSON.
Do not commit `.env.local`. Restart development after changing environment values;
for production, rebuild and redeploy because static pages embed this configuration.

For a supplied image banner, provide its original image URL, click-through URL,
actual pixel dimensions, accessible description, and three gradient colours:

```json
{
  "banner": {
    "imageUrl": "/ads/eduxplore-2026.jpg",
    "href": "https://www.eduxplore.co.za/",
    "alt": "EduXplore education events, 2026",
    "width": 798,
    "height": 204,
    "colors": ["#101c2b", "#24a6bf", "#74a844"]
  }
}
```

This example is a configuration template, not an installed banner. Upload the
original artwork and confirm the advertiser's destination before enabling it.
Image banner mode replaces the Google top slot, so only one ad is displayed.
If its image fails to load, the existing Google slot is used instead.

## Google Ad Manager

Without an image banner, the original top Google Ad Manager unit remains active.
Register each campaign's actual creative ID or line-item ID and colours:

```json
{
  "campaigns": [
    {
      "creativeIds": [123456789],
      "lineItemIds": [],
      "colors": ["#101c2b", "#24a6bf", "#74a844"],
      "creative": {
        "imageUrl": "/ads/eduxplore-side.jpg",
        "href": "https://www.eduxplore.co.za/",
        "alt": "EduXplore education events, 2026",
        "width": 160,
        "height": 600
      }
    }
  ]
}
```

Replace the example ID with the real Ad Manager ID. Google `slotRenderEnded`
events select the matching palette each time the top ad renders or refreshes.
Creative matches take precedence over line-item matches. Sidebar ads cannot
change the takeover. Unconfigured or empty ads use a visible blue/teal/gold
fallback gradient rather than white. Configured campaign colours still override it.
Client navigation refreshes the top slot with the new page's targeting.

The optional `creative` is the side artwork for that top campaign, not an
independent rotating slot. Both gutters use its image and advertiser link.
Unknown campaigns, empty top slots, missing artwork, or failed campaign images
use the temporary EduXplore placeholder. A failed placeholder image hides the
outer ads. When using a supplied `banner`, both sides repeat that exact banner
and click-through URL instead of the placeholder.

The placeholder is the original EduXplore 2026 advertisement from the
[WordPress media library](https://sahomeschooling.com/wp-content/uploads/2026/06/EduXplore-Algemene-Advertenseis-2026_Social-Media-1080x1080-1-scaled.jpg),
stored locally as `public/ads/eduxplore-side-placeholder.jpg` so it does not
depend on a remote image request. It is temporary artwork, not a claim that
EduXplore is the advertiser in an unconfigured top slot.

Google creatives are cross-origin iframes, so the site does not try to read their
image pixels. Campaign colours must be supplied alongside the campaign. This
does not upload, schedule, or change advertising campaigns in Ad Manager.
