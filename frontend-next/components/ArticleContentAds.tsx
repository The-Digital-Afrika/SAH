"use client";

import { memo, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

// Keep React from replacing the CMS markup when the ad portals mount.
const ArticleMarkup = memo(function ArticleMarkup({ html, className, contentRef }: {
  html: string; className?: string; contentRef: RefObject<HTMLDivElement | null>;
}) {
  return <div ref={contentRef} className={className} data-article-content dangerouslySetInnerHTML={{ __html: html }} />;
});

export default function ArticleContentAds({ html, ads, className }: { html: string; ads: ReactNode[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hosts, setHosts] = useState<HTMLElement[]>([]);
  useEffect(() => {
    const content = ref.current;
    if (!content) return;
    // Insert only between complete top-level blocks, preserving lists, embeds and markup.
    const blocks = Array.from(content.children).filter(element => !/^(H[1-6]|SCRIPT|STYLE)$/.test(element.tagName));
    const positions = [...new Set([Math.min(1, blocks.length - 1), Math.floor(blocks.length / 2), blocks.length - 1])].filter(index => index >= 0);
    const containers = positions.slice(0, ads.length).map(index => {
      const host = document.createElement("div");
      host.dataset.articleAd = "";
      blocks[index].after(host);
      return host;
    });
    setHosts(containers);
    return () => containers.forEach(host => host.remove());
  }, [html, ads.length]);
  return <><ArticleMarkup html={html} className={className} contentRef={ref} />{hosts.map((host, index) => createPortal(ads[index], host, String(index)))}</>;
}
