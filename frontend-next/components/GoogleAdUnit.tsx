"use client";

import { useEffect, useId } from "react";
import Script from "next/script";
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
  enableSingleRequest?: () => void;
};

type GoogleSlotRenderEvent = {
  slot: {
    getSlotElementId: () => string;
  };
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
  const suffix = idSuffix ?? generatedId.replace(/[^a-zA-Z0-9_-]/g, "");

  return `${baseId}-${suffix}`;
}

function findSize(sizes: GoogleSlotSize[], width: number, height: number) {
  return sizes.find(([sizeWidth, sizeHeight]) => sizeWidth === width && sizeHeight === height);
}

function compactAdSizes(sizes: GoogleSlotSize[]) {
  const compactSizes = sizes.filter(([width, height]) => width <= 728 && height <= 250);

  return compactSizes.length ? compactSizes : sizes;
}

function responsiveAdSizes(sizes: GoogleSlotSize[]) {
  const mobileRectangle = findSize(sizes, 300, 250);
  const compactSizes = compactAdSizes(sizes);
  const wideSizes = sizes.filter(([width]) => width >= 728);
  const desktopSizes = wideSizes.length ? wideSizes : sizes;
  const tabletSizes = wideSizes.filter(([width]) => width <= 728);
  const mobileSizes = mobileRectangle ? [mobileRectangle] : compactSizes.filter(([width]) => width <= 320);

  return {
    desktop: desktopSizes,
    tablet: tabletSizes.length ? tabletSizes : compactSizes,
    mobile: mobileSizes.length ? mobileSizes : compactSizes,
  };
}

function sizesForElement(sizes: GoogleSlotSize[], divId: string) {
  const measuredWidth = Math.floor(document.getElementById(divId)?.getBoundingClientRect().width ?? 0);
  const elementWidth = measuredWidth > 0 ? measuredWidth : window.innerWidth;
  const fittingSizes = sizes.filter(([width]) => width <= elementWidth);

  return fittingSizes.length ? fittingSizes : sizes.filter(([width]) => width <= 320);
}

function adUnitPath(networkCode: string, adUnitCode: string) {
  return adUnitCode.startsWith("/") ? adUnitCode : `/${networkCode}/${adUnitCode}`;
}

function normalizedPathname() {
  return window.location.pathname.replace(/^\/+|\/+$/g, "");
}

function commonTargeting() {
  const path = normalizedPathname();
  const [section, slug] = path.split("/");
  const isHome = !path;

  return {
    site: ["homeandschool.co.za", "sahomeschooling.com"],
    slug: isHome ? "home-2" : slug ?? section ?? "home-2",
    template: isHome ? "single-wide" : section ?? "next",
    post_type: isHome ? "page" : section === "articles" ? "post" : section || "page",
  };
}

function applyTargeting(slot: GoogleSlot) {
  const targeting = commonTargeting();

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
  const divId = clientId(ad.id, generatedId, idSuffix);
  const shouldUseGoogle = Boolean(ad.google);
  const htmlAd = shouldUseGoogle ? undefined : ad.html;
  const hasHtmlAd = Boolean(htmlAd);

  useEffect(() => {
    const google = ad.google;

    if (!google) return undefined;

    ensureGooglePublisherTagQueue();

    let slot: GoogleSlot | null = null;
    let cancelled = false;
    const pendingTimeout = window.setTimeout(() => {
      const element = document.getElementById(divId);
      if (!element || element.classList.contains("google-ad-slot--loaded")) return;

      element.classList.remove("google-ad-slot--pending");
      element.classList.add("google-ad-slot--empty");
      element.dispatchEvent(new CustomEvent(adRenderedEvent, {
        bubbles: true,
        detail: { slotId: divId, isEmpty: true },
      }));
    }, 3000);
    const path = adUnitPath(google.networkCode, google.adUnitCode);

    window.googletag?.cmd.push(() => {
      const googleTag = window.googletag;
      if (!googleTag?.defineSlot || !googleTag.pubads || !googleTag.enableServices || !googleTag.display) return;
      if (cancelled || !document.getElementById(divId)) return;

      window.saHomeschoolingAdSlots = window.saHomeschoolingAdSlots ?? {};

      const previousSlot = window.saHomeschoolingAdSlots[divId];
      if (previousSlot) {
        googleTag.destroySlots?.([previousSlot]);
        delete window.saHomeschoolingAdSlots[divId];
      }

      const slotSizes = sizesForElement(google.sizes, divId);

      slot = googleTag.defineSlot(path, slotSizes.length ? slotSizes : google.sizes, divId);
      if (!slot) return;

      const sizeMapping = googleTag.sizeMapping?.();
      if (sizeMapping && slot.defineSizeMapping) {
        const responsiveSizes = responsiveAdSizes(slotSizes.length ? slotSizes : google.sizes);

        slot.defineSizeMapping(
          sizeMapping
            .addSize([970, 0], responsiveSizes.desktop)
            .addSize([728, 0], responsiveSizes.tablet)
            .addSize([0, 0], responsiveSizes.mobile)
            .build()
        );
      }

      window.saHomeschoolingAdSlots[divId] = slot;
      const pubads = googleTag.pubads();

      applyTargeting(slot);
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

      googleTag.enableServices();
      googleTag.display(divId);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(pendingTimeout);

      if (!slot) return;

      window.googletag?.cmd.push(() => {
        window.googletag?.destroySlots?.([slot as GoogleSlot]);
        if (window.saHomeschoolingAdSlots?.[divId] === slot) {
          delete window.saHomeschoolingAdSlots[divId];
        }
      });
    };
  }, [ad.google, ad.html, divId]);

  return (
    <>
      {shouldUseGoogle ? (
        <Script id={gptScriptId} src="https://securepubads.g.doubleclick.net/tag/js/gpt.js" strategy="afterInteractive" />
      ) : null}
      <figure className="ad-unit-frame">
        <div
          id={divId}
          className={[
            "google-ad-slot",
            shouldUseGoogle ? "google-ad-slot--live" : "",
            shouldUseGoogle ? "google-ad-slot--pending" : "",
            hasHtmlAd ? "google-ad-slot--html" : "",
            sizeClass,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          data-ad-unit={ad.dataUnit}
          data-google-ad-unit={ad.google?.adUnitCode}
          aria-label="Advertisement"
          dangerouslySetInnerHTML={htmlAd ? { __html: htmlAd } : undefined}
        />
      </figure>
    </>
  );
}
