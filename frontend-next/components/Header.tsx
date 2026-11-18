"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useId, useState } from "react";
import brandStyles from "./HeaderBrand.module.css";

import { searchPages, type SearchItem } from "@/lib/search-types";

const navigationItems = [
  { label: "Home", href: "/", paths: ["/"] },
  { label: "Education", href: "/education", paths: ["/education", "/articles"] },
  { label: "Development", href: "/development", paths: ["/development", "/ask-dalena"] },
  { label: "Parenting", href: "/parenting", paths: ["/parenting", "/cooking-bonding"] },
  { label: "Directory", href: "/directory", paths: ["/directory"] },
  { label: "Partners", href: "/partners", paths: ["/partners"] },
  { label: "Magazine", href: "/magazines", paths: ["/magazines"] },
  { label: "Subscribe", href: "/subscribe", paths: ["/subscribe"] },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigationId = useId();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const activeHref = navigationItems.find(item => item.paths.some(path =>
    pathname === path || (path !== "/" && pathname.startsWith(`${path}/`))
  ))?.href;

  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const cleanQuery = query.trim();
  const matches = cleanQuery ? results : searchPages.slice(1, 7);

  useEffect(() => {
    if (!searchOpen) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const root = document.documentElement;
    const previous = { position: body.style.position, top: body.style.top, width: body.style.width };
    body.classList.add("search-open");
    root.classList.add("search-open");
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      body.classList.remove("search-open");
      root.classList.remove("search-open");
      Object.assign(body.style, previous);
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen || !cleanQuery) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch('/api/search?q=' + encodeURIComponent(cleanQuery) + '&page=' + page, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(22000)]) });
        if (!response.ok) throw new Error("Search is temporarily unavailable. Please try again.");
        const data = await response.json();
        if (controller.signal.aborted) return;
        setResults(previous => page === 1 ? data.results : [...previous, ...data.results]);
        setHasMore(data.hasMore);
        setError(data.warning ?? "");
      } catch (failure) {
        if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Unable to search. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [cleanQuery, page, searchOpen]);

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <>
      <header className={`site-header ${brandStyles.header}`} onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          event.currentTarget.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
          event.preventDefault();
        }
      }}>
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="Home&School home" onClick={() => setMenuOpen(false)}>
            <Image
              className={`brand-logo ${brandStyles.logo}`}
              src="/images/home-school-flourish-logo.png"
              alt="Home & School"
              width={2169}
              height={725}
              sizes="150px"
              preload
            />
          </Link>

          <button
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-controls={navigationId}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            {menuOpen ? "Close" : "Menu"}
          </button>

          <nav id={navigationId} className={`site-nav${menuOpen ? " open" : ""}`} aria-label="Main navigation">
            {navigationItems.map(item => (
              <Link key={item.href} href={item.href} prefetch
                onClick={() => setMenuOpen(false)}
                className={activeHref === item.href ? "active" : undefined}
                aria-current={activeHref === item.href ? "page" : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>

          <button className="search-link header-search-link" type="button" aria-label="Search" onClick={() => { setMenuOpen(false); setSearchOpen(true); }}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg>
          </button>
        </div>
      </header>

      <div className="site-search-panel" hidden={!searchOpen}>
        <div className="site-search-backdrop" data-search-close onClick={() => setSearchOpen(false)} />
        <section className="site-search-dialog" role="dialog" aria-modal="true" aria-labelledby="site-search-title">
          <button
            className="site-search-close"
            type="button"
            data-search-close
            aria-label="Close search"
            onClick={() => setSearchOpen(false)}
          >
            Close
          </button>
          <p className="kicker">Search</p>
          <h2 id="site-search-title">Find stories, recipes, and pages</h2>
          <form className="site-search-form" onSubmit={onSearchSubmit}>
            <label htmlFor="site-search-input">Search the website</label>
            <input
              id="site-search-input"
              type="search"

              autoComplete="off"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
                setResults([]);
                setHasMore(false);
                setError("");
                setLoading(Boolean(event.target.value.trim()));
              }}
            />
          </form>
          <div className="site-search-results" aria-live="polite">
            {matches.length ? (
              matches.map((item) => (
                <Link className={cleanQuery ? "search-result-card" : "search-category-card"} href={item.url} key={item.url} onClick={() => setSearchOpen(false)}>
                  {/* CMS thumbnails can come from the publication's legacy media hosts. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {item.image && <img className="search-result-image" src={item.image} alt="" loading="lazy" />}
                  <div className="search-result-copy">
                    {cleanQuery && item.category !== "Page" && <span>{item.category}</span>}
                    <strong>{item.title}</strong>
                    {item.author && <small>By {item.author}{item.date ? ` · ${item.date}` : ""}</small>}
                    {item.excerpt && <p>{item.excerpt}</p>}
                  </div>
                </Link>
              ))
            ) : (
              <p>{loading ? "Searching..." : error || "No results found. Try a broader search term."}</p>
            )}
            {matches.length > 0 && loading && <p>Searching...</p>}
            {matches.length > 0 && error && <p role="alert">{error}</p>}
            {cleanQuery && hasMore && !error && <button type="button" disabled={loading} onClick={() => setPage(current => current + 1)}>Load more results</button>}
          </div>
        </section>
      </div>
    </>
  );
}
