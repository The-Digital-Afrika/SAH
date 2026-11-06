import AdCreative from "./AdCreative";
import { getAdByPlacement } from "@/lib/wordpress";
import styles from "./ResourceCardAd.module.css";

export default async function ResourceCardAd({ id, tall = true }: { id: string; tall?: boolean }) {
  const sourceAd = await getAdByPlacement("article-sidebar");
  const tallSizes = sourceAd.google?.sizes.filter(([width, height]) => width <= 300 && height === (tall ? 600 : 250));
  const ad = { ...sourceAd, google: sourceAd.google ? {
    ...sourceAd.google,
    sizes: tallSizes?.length ? tallSizes : sourceAd.google.sizes.filter(([width]) => width <= 300),
  } : undefined };
  return (
    <div className={styles.card} data-resource-ad data-ad-format={tall ? "big" : "small"}>
      <div className={styles.creative}>
        <AdCreative ad={ad} idSuffix={`resource-${id}`}
          wrapClassName={`${styles.ad} ${tall ? "sidebar-ad-tall" : "sidebar-ad-small"}`} variant="google-ad-slot--medium-rect" fallback />
      </div>
    </div>
  );
}
