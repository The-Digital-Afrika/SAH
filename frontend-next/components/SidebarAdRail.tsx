"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import type { SiteAd } from "@/lib/wordpress";
import AdCreative from "./AdCreative";

const SIDEBAR_AD_TOTAL = 12;


type SidebarAdRailProps = {
  idPrefix: string;
  sidebarAd: SiteAd;
  footerAd: SiteAd | null;
  features?: ReactNode[];
  existingAdCount?: number;
  totalAds?: number;
};

function RailAd({ ad, idSuffix, footer = false, tall = false }: { ad: SiteAd; idSuffix: string; footer?: boolean; tall?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const matchingSizes = ad.google?.sizes.filter(([width, height]) => width <= 300 && height === (tall ? 600 : 250));
  const sizedAd = ad.google && matchingSizes?.length ? {
    ...ad, google: { ...ad.google, sizes: matchingSizes },
  } : ad;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      setActive(true);
      observer.disconnect();
    }, { rootMargin: "400px 0px" });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="section-sidebar-ad-cell" data-rail-slot={footer ? "footer" : idSuffix} data-ad-format={tall ? "big" : "small"}>
      <AdCreative
        ad={sizedAd}
        idSuffix={idSuffix}
        wrapClassName={`section-sidebar-ad ${tall ? "sidebar-ad-tall" : "sidebar-ad-small"}${footer ? " section-sidebar-footer-ad" : ""}`}
        variant="google-ad-slot--medium-rect"
        fallback
        active={active}
      />
    </div>
  );
}

export default function SidebarAdRail({ idPrefix, sidebarAd, features = [], existingAdCount = 0, totalAds = SIDEBAR_AD_TOTAL }: SidebarAdRailProps) {
  const count = Math.max(0, totalAds - existingAdCount);
  return (
    <div className="section-sidebar-lower-ads section-sidebar-ad-rail" data-sidebar-ad-total={totalAds}>
      {Array.from({ length: Math.max(count, features.length) }, (_, index) => (
        <Fragment key={`${idPrefix}-${index}`}>
          {index < features.length ? (
            <div className="section-sidebar-ad-cell" data-rail-slot={`${idPrefix}-rail-feature-${index}`}>
              {features[index]}
            </div>
          ) : null}
          {index < count ? <RailAd ad={sidebarAd} idSuffix={`${idPrefix}-rail-extra-${index + 1}`} tall={(existingAdCount + index) % 2 === 1} /> : null}
        </Fragment>
      ))}
    </div>
  );
}
