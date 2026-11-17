"use client";

import { useEffect, useId, useMemo, useState, type CSSProperties } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import type { SiteAd } from "@/lib/wordpress";
import { adRenderedEvent } from "@/lib/takeover";

type GoogleAdUnitProps = {
  ad: SiteAd;
  sizeClass: string;
  className?: string;
  idSuffix?: string;
};

type GoogleSlotSize = [number, number];

type GoogleSlot = {
  addService: (service: GooglePubAdsService) => GoogleSlot;
  defineSizeMapping?: (sizeMapping: unknown) => GoogleSlot;
  getSlotElementId?: () => string;
  getAdUnitPath?: () => string;
  setConfig?: (config: GoogleSlotConfig) => GoogleSlot;
  setTargeting?: (key: string, value: string | string[]) => GoogleSlot;
};

type GoogleSlotConfig = {
  collapseDiv?: "BEFORE_FETCH" | "ON_NO_FILL" | "DISABLED" | null;
  targeting?: Record<string, string | string[]>;
};

type GoogleSizeMapping = {
  addSize: (viewportSize: GoogleSlotSize, slotSizes: Array<GoogleSlotSize | "fluid">) => GoogleSizeMapping;
  build: () => unknown;
};

type GooglePubAdsService = {
  collapseEmptyDivs?: () => void;
  addEventListener?: (eventName: "slotRenderEnded", listener: (event: GoogleSlotRenderEvent) => void) => void;
  removeEventListener?: (eventName: "slotRenderEnded", listener: (event: GoogleSlotRenderEvent) => void) => void;
  enableSingleRequest?: () => void;
};

type GoogleSlotRenderEvent = {
  slot: GoogleSlot;
  isEmpty: boolean;
  creativeId?: number | null;
  lineItemId?: number | null;
};

type GoogleTag = {
  cmd: Array<() => void>;
  defineSlot?: (adUnitPath: string, sizes: GoogleSlotSize[], divId: string) => GoogleSlot | null;
  destroySlots?: (slots: GoogleSlot[]) => boolean;
  display?: (divId: string) => void;
  enableServices?: () => void;
  pubads?: () => GooglePubAdsService;
  setConfig?: (config: GooglePageConfig) => void;
  sizeMapping?: () => GoogleSizeMapping;
};

type GooglePageConfig = {
  collapseDiv?: "BEFORE_FETCH" | "ON_NO_FILL" | "DISABLED" | null;
  singleRequest?: boolean;
};

declare global {
  interface Window {
    googletag?: GoogleTag;
    saHomeschoolingAdSlots?: Record<string, GoogleSlot>;
    saHomeschoolingAdsConfigured?: boolean;
  }
}

const gptScriptId = "google-publisher-tag-script";

function ensureGooglePublisherTagQueue() {
  window.googletag = window.googletag ?? { cmd: [] };
}

function clientId(baseId: string, generatedId: string, idSuffix?: string) {
  const suffix = [idSuffix, generatedId].filter(Boolean).join("-").replace(/[^a-zA-Z0-9_-]/g, "");

  return `${baseId}-${suffix}`;
}

function measureSlot(element: HTMLElement) {
  const styles = window.getComputedStyle(element);
  const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
  return {
    viewportWidth,
    width: availableAdWidth(element.clientWidth, parseFloat(styles.paddingLeft) || 0, parseFloat(styles.paddingRight) || 0, viewportWidth),
  };
}

function adUnitPath(networkCode: string, adUnitCode: string) {
  return adUnitCode.startsWith("/") ? adUnitCode : `/${networkCode}/${adUnitCode}`;
}

function commonTargeting(pathname: string) {
  const path = pathname.replace(/^\/+|\/+$/g, "");
  const [section, slug] = path.split("/");
  const isHome = !path;

  return {
    site: ["homeandschool.co.za", "sahomeschooling.com"],
    slug: isHome ? "home-2" : slug ?? section ?? "home-2",
    template: isHome ? "single-wide" : section ?? "next",
    post_type: isHome ? "page" : section === "articles" ? "post" : section || "page",
  };
}

function applyTargeting(slot: GoogleSlot, pathname: string) {
  const targeting = commonTargeting(pathname);

  if (slot.setConfig) {
    slot.setConfig({ targeting });
    return;
  }

  Object.entries(targeting).forEach(([key, value]) => {
    slot.setTargeting?.(key, value);
  });
}

function configureGoogleTag(googleTag: GoogleTag, pubads: GooglePubAdsService) {
  if (googleTag.setConfig) {
    googleTag.setConfig({
      collapseDiv: "ON_NO_FILL",
      singleRequest: true,
    });
    return;
  }

  pubads.collapseEmptyDivs?.();
  pubads.enableSingleRequest?.();
}

export default function GoogleAdUnit({ ad, sizeClass, className = "", idSuffix }: GoogleAdUnitProps) {
  const generatedId = useId();
  const pathname = usePathname() ?? "/";
  const divId = clientId(ad.id, generatedId, idSuffix);
  // Server navigation may supply a new object containing the same configuration.
  const googleKey = ad.google ? JSON.stringify(ad.google) : "";
  const google = useMemo(() => googleKey ? JSON.parse(googleKey) as NonNullable<SiteAd["google"]> : undefined, [googleKey]);
  const leaderboard = google?.adUnitCode.split("/").pop() === "sahomeschooling_home_leaderboard";
  const responsiveHome = Boolean(google?.responsiveHomeLeaderboard);
  const htmlAd = google ? undefined : ad.html;
  const [sizesKey, setSizesKey] = useState<string | null>(null);
  const suppressed = sizesKey === "[]";
  const selectedSizes: GoogleSlotSize[] = sizesKey ? JSON.parse(sizesKey) : [];
  const reservedHeight = selectedSizes.length ? Math.max(...selectedSizes.map(([, height]) => height)) : undefined;

  useEffect(() => {
    if (!google) return;
    const element = document.getElementById(divId);
    if (!element) return;
    const measure = () => {
      const { width, viewportWidth } = measureSlot(element);
      setSizesKey(JSON.stringify(responsiveSlotSizes(google.sizes, width, viewportWidth, leaderboard)));
    };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.parentElement) observer.observe(element.parentElement);
    window.addEventListener("resize", measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [divId, google, leaderboard]);

  useEffect(() => {
    if (!google || !sizesKey || sizesKey === "[]") return;
    ensureGooglePublisherTagQueue();
    let slot: GoogleSlot | null = null;
    let pubads: GooglePubAdsService | undefined;
    let cancelled = false;
    const onRender = (event: GoogleSlotRenderEvent) => {
      // Ignore late events from a destroyed slot sharing this element ID.
      if (cancelled || event.slot !== slot) return;
      const element = document.getElementById(divId);
      if (!element) return;
      if (event.size) {
        element.style.setProperty("--ad-creative-width", `${event.size[0]}px`);
        element.style.setProperty("--ad-creative-height", `${event.size[1]}px`);
        element.style.setProperty("--home-creative-width", `${event.size[0]}px`);
        element.style.setProperty("--home-creative-height", `${event.size[1]}px`);
      }
      element.classList.remove("google-ad-slot--pending");
      element.classList.toggle("google-ad-slot--loaded", !event.isEmpty);
      element.classList.toggle("google-ad-slot--empty", event.isEmpty);
    };
      element.classList.add("google-ad-slot--empty");
      element.dispatchEvent(new CustomEvent(adRenderedEvent, {
        bubbles: true,
        detail: { slotId: divId, isEmpty: true },
      }));
    }, 3000);
    const path = adUnitPath(google.networkCode, google.adUnitCode);

    window.googletag?.cmd.push(() => {
      const googleTag = window.googletag;
      const element = document.getElementById(divId);
      if (cancelled || !element || !googleTag?.defineSlot || !googleTag.pubads || !googleTag.enableServices || !googleTag.display) return;
      // Re-measure when GPT is ready, rather than trusting a queued measurement.
      const { width, viewportWidth } = measureSlot(element);
      const slotSizes = responsiveSlotSizes(google.sizes, width, viewportWidth, leaderboard);
      const currentSizesKey = JSON.stringify(slotSizes);
      if (currentSizesKey !== sizesKey) {
        setSizesKey(currentSizesKey);
        return;
      }
      if (!slotSizes.length) return;
      window.saHomeschoolingAdSlots = window.saHomeschoolingAdSlots ?? {};
      const previousSlot = window.saHomeschoolingAdSlots[divId];
      if (previousSlot) googleTag.destroySlots?.([previousSlot]);
      slot = googleTag.defineSlot(adUnitPath(google.networkCode, google.adUnitCode), slotSizes, divId);
      if (!slot) return;
      window.saHomeschoolingAdSlots[divId] = slot;
      const sizeMapping = googleTag.sizeMapping?.();
      if (sizeMapping && slot.defineSizeMapping) {
        // Only map sizes admitted by the current container/viewport measurement.
        responsiveSlotMapping(slotSizes, width, leaderboard).forEach(({ viewport, sizes }) => {
          sizeMapping.addSize(viewport, sizes);
        });
        const mapping = sizeMapping.build();
        if (mapping) slot.defineSizeMapping(mapping);
      }
      pubads = googleTag.pubads();
      applyTargeting(slot, pathname);
      // Leave dimensions under frontend control so an empty response cannot hide
      // the measurement surface or cause a resize/re-request loop.
      slot.setConfig?.({ collapseDiv: "DISABLED" });
      slot.addService(pubads);
      if (!window.saHomeschoolingAdsConfigured) {
        configureGoogleTag(googleTag, pubads);
        pubads.addEventListener?.("slotRenderEnded", (event) => {
          const element = document.getElementById(event.slot.getSlotElementId());
          if (!element) return;

          element.classList.remove("google-ad-slot--pending");
          element.classList.toggle("google-ad-slot--loaded", !event.isEmpty);
          element.classList.toggle("google-ad-slot--empty", event.isEmpty);
          element.dispatchEvent(new CustomEvent(adRenderedEvent, {
            bubbles: true,
            detail: {
              slotId: element.id,
              isEmpty: event.isEmpty,
              creativeId: event.creativeId,
              lineItemId: event.lineItemId,
            },
          }));
        });
        window.saHomeschoolingAdsConfigured = true;
      }
      pubads.addEventListener?.("slotRenderEnded", onRender);
      element.classList.remove("google-ad-slot--loaded", "google-ad-slot--empty");
      element.classList.add("google-ad-slot--pending");
      googleTag.enableServices();
      googleTag.display(divId);
    });

    return () => {
      cancelled = true;
      if (!slot) return;
      pubads?.removeEventListener?.("slotRenderEnded", onRender);
      const destroyedSlot = slot;
      window.googletag?.cmd.push(() => {
        window.googletag?.destroySlots?.([destroyedSlot]);
        if (window.saHomeschoolingAdSlots?.[divId] === destroyedSlot) {
          delete window.saHomeschoolingAdSlots[divId];
        }
      });
    };
  }, [google, divId, leaderboard, pathname, sizesKey]);

  return (
    <>
      {google ? (
        <Script id={gptScriptId} src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" strategy="afterInteractive" />
      ) : null}
      <figure
        className={`ad-unit-frame${google ? " responsive-ad-frame" : ""}${responsiveHome ? " home-leaderboard-frame" : ""}`}
        style={google ? { "--ad-reserved-height": reservedHeight === undefined ? undefined : `${reservedHeight}px` } as CSSProperties : undefined}
      >
        <div
          id={divId}
          className={[
            "google-ad-slot",
            google ? "google-ad-slot--live google-ad-slot--pending" : "",
            suppressed ? "google-ad-slot--suppressed" : "",
            htmlAd ? "google-ad-slot--html" : "",
            sizeClass,
            className,
          ].filter(Boolean).join(" ")}
          data-ad-unit={ad.dataUnit}
          data-google-ad-unit={google?.adUnitCode}
          data-responsive-ad={google ? leaderboard ? "leaderboard" : "sidebar" : undefined}
          data-home-leaderboard={responsiveHome ? "true" : undefined}
          aria-label="Advertisement"
          dangerouslySetInnerHTML={htmlAd ? { __html: htmlAd } : undefined}
        />
      </figure>
    </>
  );
}
