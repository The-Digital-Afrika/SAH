"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { SiteAd } from "@/lib/wordpress";
import {
  adRenderedEvent, colorsForAd, fallbackTakeoverColors,
  type AdRenderedDetail, type TakeoverColors,
} from "@/lib/takeover";
import GoogleAdUnit from "./GoogleAdUnit";
import styles from "./SiteTakeover.module.css";

type SidePromotion = {
  title: string;
  href: string;
  image: { src: string; alt: string; width: number; height: number };
};

export default function SiteTakeover({ ad, sidePromotion, children }: {
  ad: SiteAd;
  sidePromotion?: SidePromotion;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [rendered, setRendered] = useState<{ pathname: string; colors: TakeoverColors }>();
  const [failedBanner, setFailedBanner] = useState<string>();
  const banner = ad.takeover?.banner;
  const showBanner = banner && failedBanner !== banner.imageUrl;
  const palette = showBanner ? banner.colors
    : rendered?.pathname === pathname ? rendered.colors : fallbackTakeoverColors;

  useEffect(() => {
    function onAdRendered(event: Event) {
      const detail = (event as CustomEvent<AdRenderedDetail>).detail;
      if (detail?.slotId !== `${ad.id}-site-takeover`) return;
      setRendered({ pathname, colors: colorsForAd(ad.takeover, detail) });
    }
    window.addEventListener(adRenderedEvent, onAdRendered);
    return () => window.removeEventListener(adRenderedEvent, onAdRendered);
  }, [ad.id, ad.takeover, pathname]);

  const style = {
    "--takeover-start": palette[0],
    "--takeover-middle": palette[1],
    "--takeover-end": palette[2],
  } as CSSProperties;

  return (
    <div className={styles.takeover} style={style} data-site-takeover>
      <div className={styles.masthead} data-takeover-top-ad aria-label="Advertisement">
        <span className={styles.label}>Advertisement</span>
        {showBanner ? (
          <a className={styles.banner} href={banner.href} target="_blank" rel="noopener noreferrer">
            <Image src={banner.imageUrl} alt={banner.alt} width={banner.width} height={banner.height}
              sizes="(max-width: 1002px) calc(100vw - 32px), 970px" unoptimized preload
              onError={() => setFailedBanner(banner.imageUrl)} />
          </a>
        ) : (
          <div className={styles.topAd}>
            <GoogleAdUnit ad={ad} sizeClass="google-ad-slot--leaderboard" idSuffix="site-takeover" key={pathname} />
          </div>
        )}
      </div>
      <div className={styles.frame}>
        {sidePromotion ? (
          <SideAd promotion={sidePromotion} side="left" />
        ) : null}
        <div className={styles.site} data-takeover-content>{children}</div>
        {sidePromotion ? (
          <SideAd promotion={sidePromotion} side="right" />
        ) : null}
      </div>
    </div>
  );
}

function SideAd({ promotion, side }: { promotion: SidePromotion; side: "left" | "right" }) {
  return (
    <aside className={`${styles.sideAd} ${styles[side]}`} data-takeover-side-ad={side} aria-label="Magazine advertisement">
      <a href={promotion.href} target="_blank" rel="noopener noreferrer" aria-label={`Read ${promotion.title}`}>
        <span className={styles.sideTitle}>{promotion.title}</span>
        <Image src={promotion.image.src} alt={promotion.image.alt} width={promotion.image.width}
          height={promotion.image.height} sizes="160px" />
        <span className={styles.sideAction}>Read the magazine</span>
      </a>
    </aside>
  );
}
