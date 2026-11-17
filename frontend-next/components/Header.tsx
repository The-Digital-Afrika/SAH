"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import brandStyles from "./HeaderBrand.module.css";

const searchItems = [
  { title: "Education", url: "/education", category: "Education" },
  { title: "Development", url: "/development", category: "Development" },
  { title: "Parenting", url: "/parenting", category: "Parenting" },
  { title: "Directory", url: "/directory", category: "Directory" },
  { title: "Partners", url: "/partners", category: "Partners" },
  { title: "Magazines", url: "/magazines", category: "Magazines" },
  { title: "Newsletter Subscribe", url: "/subscribe", category: "Subscribe" },
];

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
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const activeHref = navigationItems.find(item => item.paths.some(path =>
    pathname === path || (path !== "/" && pathname.startsWith(`${path}/`))
  ))?.href;

  const matches = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    return cleanQuery
      ? searchItems.filter((item) => `${item.title} ${item.category}`.toLowerCase().includes(cleanQuery))
      : searchItems.slice(0, 6);
  }, [query]);

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (matches[0]) {
      window.location.href = matches[0].url;
    }
  }

  return (
    <>
      <header className={`site-header ${brandStyles.header}`}>
        <div className="header-inner">
          <Link className="brand" href="/" aria-label="Home&School home">
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
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((isOpen) => !isOpen)}
          >
            Menu
          </button>

          <nav className={`site-nav${menuOpen ? " open" : ""}`} aria-label="Main navigation">
            {navigationItems.map(item => (
              <Link key={item.href} href={item.href} prefetch
                className={activeHref === item.href ? "active" : undefined}
                aria-current={activeHref === item.href ? "page" : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>

          <button className="search-link header-search-link" type="button" aria-label="Search" onClick={() => setSearchOpen(true)}>
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
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
          <div className="site-search-results" aria-live="polite">
            {matches.length ? (
              matches.map((item) => (
                <Link href={item.url} key={item.url} onClick={() => setSearchOpen(false)}>
                  <strong>{item.title}</strong>
                </Link>
              ))
            ) : (
              <p>No results found. Try a broader search term.</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
