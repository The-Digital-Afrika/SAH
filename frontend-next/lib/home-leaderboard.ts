export type BannerSize = [number, number];

// Both dimensions are measured in CSS pixels. Never fall back to a wider ad.
export function homeLeaderboardWidth(containerWidth: number, viewportWidth: number) {
  const width = Math.floor(Math.min(containerWidth, viewportWidth));
  return width >= 970 ? 970 : width >= 728 ? 728 : width >= 320 ? 320 : 0;
}

export function homeLeaderboardSizes(sizes: BannerSize[], width: number): BannerSize[] {
  if (width >= 728) return sizes.filter(([w]) => w >= 728 && w <= width);
  return sizes.filter(([w]) => w === 320 && w <= width);
}

export function homeLeaderboardMapping(sizes: BannerSize[], width: number) {
  return [970, 728, 320, 0].map((viewportWidth) => ({
    viewport: [viewportWidth, 0] as BannerSize,
    sizes: homeLeaderboardSizes(sizes, Math.min(width, viewportWidth)),
  }));
}

export function availableAdWidth(clientWidth: number, paddingLeft: number, paddingRight: number, viewportWidth: number) {
  // clientWidth already excludes borders and scrollbars.
  return Math.max(0, Math.floor(Math.min(clientWidth - paddingLeft - paddingRight, viewportWidth)));
}

export function responsiveSlotSizes(sizes: BannerSize[], width: number, viewportWidth: number, leaderboard: boolean) {
  if (leaderboard) return homeLeaderboardSizes(sizes, Math.min(width, viewportWidth));
  return sizes.filter(([w, h]) => w <= width && w <= viewportWidth && (viewportWidth >= 970 || h <= 250));
}

export function responsiveSlotMapping(sizes: BannerSize[], width: number, leaderboard: boolean) {
  const breakpoints = leaderboard ? [970, 728, 320, 0] : [970, 300, 0];
  return breakpoints.map((viewportWidth) => ({
    viewport: [viewportWidth, 0] as BannerSize,
    sizes: responsiveSlotSizes(sizes, width, viewportWidth, leaderboard),
  }));
}
