export type TakeoverColors = [string, string, string];

export type TakeoverCampaign = {
  creativeIds: number[];
  lineItemIds: number[];
  colors: TakeoverColors;
};

export type TakeoverConfig = {
  banner?: {
    imageUrl: string;
    href: string;
    alt: string;
    width: number;
    height: number;
    colors: TakeoverColors;
  };
  campaigns: TakeoverCampaign[];
};

export type AdRenderedDetail = {
  slotId: string;
  isEmpty: boolean;
  creativeId?: number | null;
  lineItemId?: number | null;
};

export const adRenderedEvent = "homeandschool:ad-rendered";
export const fallbackTakeoverColors: TakeoverColors = ["#12536e", "#329fb0", "#b7ac54"];

function object(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}

function colors(value: unknown): TakeoverColors | undefined {
  return Array.isArray(value) && value.length === 3 && value.every(
    color => typeof color === "string" && /^#[a-f\d]{3}(?:[a-f\d]{3})?$/i.test(color),
  ) ? value as TakeoverColors : undefined;
}

function ids(value: unknown): number[] {
  return Array.isArray(value) ? value.filter(
    (id): id is number => typeof id === "number" && Number.isSafeInteger(id) && id > 0,
  ) : [];
}

function publicUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value || value !== value.trim() || /[\\\s]/.test(value)) return undefined;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

export function parseTakeoverConfig(value: unknown): TakeoverConfig | undefined {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { return undefined; }
  }
  const config = object(value);
  if (!config) return undefined;
  const campaigns = Array.isArray(config.campaigns) ? config.campaigns.flatMap(value => {
    const campaign = object(value);
    const palette = colors(campaign?.colors);
    const creativeIds = ids(campaign?.creativeIds);
    const lineItemIds = ids(campaign?.lineItemIds);
    return palette && (creativeIds.length || lineItemIds.length)
      ? [{ creativeIds, lineItemIds, colors: palette }]
      : [];
  }) : [];
  const banner = object(config.banner);
  const imageUrl = publicUrl(banner?.imageUrl);
  const href = publicUrl(banner?.href);
  const palette = colors(banner?.colors);
  const width = banner?.width;
  const height = banner?.height;
  if (imageUrl && href && palette && typeof width === "number" && typeof height === "number"
    && Number.isSafeInteger(width) && Number.isSafeInteger(height) && width > 0 && height > 0
    && width <= 10000 && height <= 10000 && typeof banner?.alt === "string" && banner.alt.trim()) {
    return { campaigns, banner: { imageUrl, href, colors: palette, width, height, alt: banner.alt.trim() } };
  }
  return campaigns.length ? { campaigns } : undefined;
}

export function colorsForAd(config: TakeoverConfig | undefined, ad: AdRenderedDetail): TakeoverColors {
  if (ad.isEmpty) return fallbackTakeoverColors;
  const campaign = config?.campaigns.find(campaign =>
    ad.creativeId != null && campaign.creativeIds.includes(ad.creativeId),
  ) ?? config?.campaigns.find(campaign =>
    ad.lineItemId != null && campaign.lineItemIds.includes(ad.lineItemId),
  );
  return campaign?.colors ?? fallbackTakeoverColors;
}
