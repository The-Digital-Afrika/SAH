"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "./StickySidebar.module.css";

export default function StickySidebar({ children, className = "", label = "Sidebar", independentScroll = false }: {
  children: ReactNode; className?: string; label?: string; independentScroll?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const sidebar = ref.current;
    if (!sidebar) return;
    function measure() {
      if (!sidebar) return;
      const header = document.querySelector(".site-header");
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      sidebar.style.setProperty("--sidebar-header-offset", `${headerHeight + 16}px`);
      if (independentScroll) {
        // Compensate for the scrollbar so 300px paid creatives keep their full width.
        sidebar.style.setProperty("--sidebar-scrollbar-width", `${Math.max(0, sidebar.offsetWidth - sidebar.clientWidth)}px`);
      }
      // A tall rail scrolls normally until its bottom reaches the viewport.
      const top = Math.min(headerHeight + 16, window.innerHeight - sidebar.getBoundingClientRect().height - 16);
      sidebar.style.setProperty("--sidebar-sticky-top", `${top}px`);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(sidebar);
    const header = document.querySelector(".site-header");
    if (header) observer.observe(header);
    window.addEventListener("resize", measure);
    measure();
    return () => { observer.disconnect(); window.removeEventListener("resize", measure); };
  }, [independentScroll]);
  return <aside ref={ref} className={`${className} ${styles.sidebar}${independentScroll ? ` ${styles.scrollable}` : ""}`}
    data-sticky-sidebar data-independent-scroll={independentScroll || undefined} tabIndex={independentScroll ? 0 : undefined} aria-label={label}>{children}</aside>;
}
