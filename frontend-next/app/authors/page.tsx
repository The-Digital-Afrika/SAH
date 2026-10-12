import type { Metadata } from "next";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";
import AuthorAvatar from "@/components/AuthorAvatar";
import FeaturedMosaic from "@/components/FeaturedMosaic";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getAuthorBio, getAuthors, getPosts } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Authors",
  description: "Meet the SA Homeschooling & Beyond contributors and browse their published articles.",
  alternates: {
    canonical: "/authors",
  },
  openGraph: {
    title: "Authors | SA Homeschooling & Beyond",
    description: "Meet the SA Homeschooling & Beyond contributors and browse their published articles.",
    url: "/authors",
  },
};

export default async function AuthorsPage() {
  const [authors, latestPosts] = await Promise.all([getAuthors(), getPosts({ perPage: 4 })]);

  return (
    <div className="directory-page">
      <Header />

      <FeaturedMosaic posts={latestPosts} className="page-featured-mosaic" />

      <main className="newsletter-page">
        <section className="author-header">
          <div className="author-avatar" aria-hidden="true" />
          <div>
            <span className="kicker">Contributors</span>
            <h1>Authors</h1>
            <p>Meet the writers behind SA Homeschooling &amp; Beyond.</p>
          </div>
        </section>

        <section className="directory-list" aria-label="Authors">
          {authors.length ? (
            authors.map((author) => (
              <article className="directory-card" key={author.id}>
                <AuthorAvatar author={author} size={96} />
                <h2>{author.name}</h2>
                <p>{getAuthorBio(author)}</p>
                <Link href={`/authors/${author.slug}`}>View author profile</Link>
              </article>
            ))
          ) : (
            <p className="archive-loading">Author profiles are temporarily unavailable. Please check back soon.</p>
          )}
        </section>

        <AdBanner placement="home-bottom" wrapClassName="archive-pagination-ad" variant="google-ad-slot--wide-banner" />
      </main>

      <Footer />
    </div>
  );
}
