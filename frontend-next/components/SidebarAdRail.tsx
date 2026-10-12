"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import type { SiteAd } from "@/lib/wordpress";
import AdCreative from "./AdCreative";

const minimumAdHeight = 274;
const adGap = 24;

type SidebarAdRailProps = {
  idPrefix: string;
  sidebarAd: SiteAd;
  footerAd: SiteAd;
  features?: ReactNode[];
};

function RailAd({ ad, idSuffix, footer = false }: { ad: SiteAd; idSuffix: string; footer?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

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
    <div ref={ref} className="section-sidebar-ad-cell" data-rail-slot={footer ? "footer" : idSuffix}>
      <AdCreative
        ad={ad}
        idSuffix={idSuffix}
        wrapClassName={`section-sidebar-ad${footer ? " section-sidebar-footer-ad" : ""}`}
        variant="google-ad-slot--medium-rect"
        fallback
        active={active}
      />
    </div>
  );
}

export default function SidebarAdRail({ idPrefix, sidebarAd, footerAd, features = [] }: SidebarAdRailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ count: 2, height: 0 });
  const featureCount = features.length;

  useEffect(() => {
    const rail = ref.current;
    const sidebar = rail?.closest(".section-sidebar");
    const content = rail?.closest(".section-page-layout")?.querySelector(".section-page-content");
    if (!rail || !sidebar || !content) return;

    const desktop = window.matchMedia("(min-width: 1101px)");
    const measuredHeights = new Map<string, number>();
    const observed = new Set<Element>();
    let frame = 0;

    function measure() {
      if (!rail || !content) return;
      let count = 2;
      let height = 0;

      if (desktop.matches) {
        rail.querySelectorAll<HTMLElement>(".section-sidebar-ad-cell").forEach((cell) => {
          const key = cell.dataset.railSlot ?? "";
          const minimum = key.includes("-rail-feature-") ? 0 : minimumAdHeight;
          measuredHeights.set(key, Math.max(minimum, cell.getBoundingClientRect().height));
        });
        // Read the content's intrinsic height, never the stretched grid/sidebar height.
        height = Math.max(0, Math.ceil(content.getBoundingClientRect().bottom - rail.getBoundingClientRect().top));
        let occupied = measuredHeights.get("footer") ?? minimumAdHeight;
        for (let index = 0; index < featureCount; index += 1) {
          occupied += adGap + (measuredHeights.get(`${idPrefix}-rail-feature-${index}`) ?? minimumAdHeight);
        }
        count = 0;

        while (occupied < height) {
          const rowHeight = measuredHeights.get(`${idPrefix}-rail-extra-${count + 1}`) ?? minimumAdHeight;
          occupied += adGap + rowHeight;
          count += 1;
        }
      }

      setLayout((previous) => previous.count === count && previous.height === height ? previous : { count, height });
    }

    function scheduleMeasure() {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(measure);
    }

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    function observeCells() {
      if (!rail) return;
      rail.querySelectorAll(".section-sidebar-ad-cell").forEach((cell) => {
        if (observed.has(cell)) return;
        observed.add(cell);
        resizeObserver.observe(cell);
      });
      observed.forEach((cell) => {
        if (rail.contains(cell)) return;
        resizeObserver.unobserve(cell);
        observed.delete(cell);
      });
      scheduleMeasure();
    }

    resizeObserver.observe(content);
    Array.from(sidebar.children).forEach((child) => resizeObserver.observe(child));
    const mutationObserver = new MutationObserver(observeCells);
    mutationObserver.observe(rail, { childList: true });
    desktop.addEventListener("change", scheduleMeasure);
    observeCells();

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      desktop.removeEventListener("change", scheduleMeasure);
    };
  }, [idPrefix, featureCount]);

  return (
    <div
      ref={ref}
      className="section-sidebar-lower-ads section-sidebar-ad-rail"
      style={layout.height ? { minHeight: layout.height } : undefined}
    >
      {Array.from({ length: Math.max(layout.count, featureCount) }, (_, index) => (
        <Fragment key={`${idPrefix}-${index}`}>
          {index < featureCount ? (
            <div className="section-sidebar-ad-cell" data-rail-slot={`${idPrefix}-rail-feature-${index}`}>
              {features[index]}
            </div>
          ) : null}
          {index < layout.count ? <RailAd ad={sidebarAd} idSuffix={`${idPrefix}-rail-extra-${index + 1}`} /> : null}
        </Fragment>
      ))}
      <RailAd ad={footerAd} idSuffix={`${idPrefix}-rail-footer`} key={`${idPrefix}-footer`} footer />
    </div>
  );
}
