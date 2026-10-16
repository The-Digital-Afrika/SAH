"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import brandStyles from "./HeaderBrand.module.css";

const searchItems = [
  { title: "Education articles", url: "/articles", category: "Education" },
  { title: "Development", url: "/category/development", category: "Development" },
  { title: "Ask Dalena", url: "/category/ask-dalena", category: "Development" },
  { title: "Parenting", url: "/category/parenting", category: "Parenting" },
  { title: "Cooking & Bonding", url: "/category/cooking-bonding", category: "Parenting" },
  { title: "Directory", url: "/directory", category: "Directory" },
  { title: "Partners", url: "/category/partner-2", category: "Partners" },
  { title: "Magazines", url: "/magazines", category: "Magazines" },
  { title: "Newsletter Subscribe", url: "/subscribe", category: "Subscribe" },
];

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

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
            <Link className={pathname === "/" ? "active" : undefined} href="/" prefetch>
              Home
            </Link>
            <Link className={pathname.startsWith("/articles") ? "active" : undefined} href="/articles" prefetch>
              Education
            </Link>
            <Link className={pathname.startsWith("/category/development") ? "active" : undefined} href="/category/development" prefetch>
              Development
            </Link>
            <Link className={pathname.startsWith("/category/parenting") ? "active" : undefined} href="/category/parenting" prefetch>
              Parenting
            </Link>
            <Link className={pathname === "/directory" ? "active" : undefined} href="/directory" prefetch>
              Directory
            </Link>
            <Link className={pathname.startsWith("/category/partner-2") ? "active" : undefined} href="/category/partner-2" prefetch>
              Partners
            </Link>
            <Link className={pathname === "/magazines" ? "active" : undefined} href="/magazines" prefetch>
              Magazines
            </Link>
            <Link className={pathname === "/subscribe" ? "active" : undefined} href="/subscribe" prefetch>
              Subscribe
            </Link>
          </nav>

          <button className="search-link header-search-link" type="button" aria-label="Search" onClick={() => setSearchOpen(true)}>
            Search
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
              placeholder="Type a title or topic"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </form>
          <div className="site-search-results" aria-live="polite">
            {matches.length ? (
              matches.map((item) => (
                <Link href={item.url} key={item.url} onClick={() => setSearchOpen(false)}>
                  <span>{item.category}</span>
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


