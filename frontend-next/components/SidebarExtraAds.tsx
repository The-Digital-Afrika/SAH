import { getAdByPlacement } from "@/lib/wordpress";
import SidebarAdRail from "./SidebarAdRail";

export default async function SidebarExtraAds({ idPrefix, existingAdCount = 2, totalAds }: { idPrefix: string; existingAdCount?: number; totalAds?: number }) {
  const sidebarAd = await getAdByPlacement("article-sidebar");
  return <SidebarAdRail idPrefix={idPrefix} sidebarAd={sidebarAd} footerAd={null} existingAdCount={existingAdCount} totalAds={totalAds} />;
}
