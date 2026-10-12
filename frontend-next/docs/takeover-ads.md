# Site Takeover Ads

The shared root layout owns the only above-header ad position on every page.
Page gutters use the matching campaign gradient. Existing in-content and sidebar
ads are unchanged. No magazine advert is used as a takeover fallback.

The desktop content frame is capped at 1152px so the coloured gutters are visible
at normal browser zoom. At viewport widths of 1400px and above, small magazine
promotions appear in both outer gutters using the latest available WordPress
cover and reader link. They stay outside the content and are hidden on smaller
screens. They do not add another top banner or replace the existing sidebar ads.

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
      "colors": ["#101c2b", "#24a6bf", "#74a844"]
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

Google creatives are cross-origin iframes, so the site does not try to read their
image pixels. Campaign colours must be supplied alongside the campaign. This
does not upload, schedule, or change advertising campaigns in Ad Manager.
