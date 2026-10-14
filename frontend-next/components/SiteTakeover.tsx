"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import type { SiteAd } from "@/lib/wordpress";
import {
  adRenderedEvent, colorsForAd, creativeForAd, fallbackTakeoverColors,
  type AdRenderedDetail, type TakeoverColors, type TakeoverCreative,
} from "@/lib/takeover";
import GoogleAdUnit from "./GoogleAdUnit";
import styles from "./SiteTakeover.module.css";

const sidePlaceholder: TakeoverCreative = {
  imageUrl: "/ads/eduxplore-side-placeholder.jpg",
  href: "https://eduxplore.co.za/",
  alt: "EduXplore education expo advertisement",
  width: 2560,
  height: 2560,
};

export default function SiteTakeover({ ad, children }: {
  ad: SiteAd;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [rendered, setRendered] = useState<{ pathname: string; colors: TakeoverColors; creative?: TakeoverCreative }>();
  const [failedBanner, setFailedBanner] = useState<string>();
  const [failedSide, setFailedSide] = useState<string>();
  const banner = ad.takeover?.banner;
  const showBanner = banner && failedBanner !== banner.imageUrl;
  const palette = showBanner ? banner.colors
    : rendered?.pathname === pathname ? rendered.colors : fallbackTakeoverColors;
  const matchedCreative = showBanner ? banner : rendered?.pathname === pathname ? rendered.creative : undefined;
  const sideCreative = matchedCreative && matchedCreative.imageUrl !== failedSide ? matchedCreative : sidePlaceholder;
  const showSides = sideCreative.imageUrl !== failedSide;

  useEffect(() => {
    function onAdRendered(event: Event) {
      const detail = (event as CustomEvent<AdRenderedDetail>).detail;
      if (detail?.slotId !== `${ad.id}-site-takeover`) return;
      setRendered({ pathname, colors: colorsForAd(ad.takeover, detail), creative: creativeForAd(ad.takeover, detail) });
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
        {showSides ? (
          <SideAd creative={sideCreative} side="left" placeholder={sideCreative === sidePlaceholder} onError={() => setFailedSide(sideCreative.imageUrl)} />
        ) : null}
        <div className={styles.site} data-takeover-content>{children}</div>
        {showSides ? (
          <SideAd creative={sideCreative} side="right" placeholder={sideCreative === sidePlaceholder} onError={() => setFailedSide(sideCreative.imageUrl)} />
        ) : null}
      </div>
    </div>
  );
}

function SideAd({ creative, side, placeholder, onError }: { creative: TakeoverCreative; side: "left" | "right"; placeholder: boolean; onError: () => void }) {
  return (
    <aside className={`${styles.sideAd} ${styles[side]}`} data-takeover-side-ad={side} data-takeover-placeholder={placeholder || undefined} aria-label="Advertisement">
      <a href={creative.href} target="_blank" rel="noopener noreferrer" aria-label={creative.alt}>
        <span>Advertisement</span>
        <Image src={creative.imageUrl} alt={creative.alt} width={creative.width}
          height={creative.height} sizes="160px" unoptimized onError={onError} />
      </a>
    </aside>
  );
}
