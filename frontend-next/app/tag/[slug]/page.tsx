import type { Metadata } from "next";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";
import ArticleCard from "@/components/ArticleCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterAdStack from "@/components/NewsletterAdStack";
import { getPostsByTag, getTagBySlug } from "@/lib/wordpress";

type TagPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  const title = tag?.name ?? titleFromSlug(slug);
  const description = tag?.description || `Browse SA Homeschooling & Beyond articles tagged ${title}.`;

  return {
    title: `${title} Articles`,
    description,
    alternates: {
      canonical: `/tag/${slug}`,
    },
    openGraph: {
      title: `${title} Articles | SA Homeschooling & Beyond`,
      description,
      url: `/tag/${slug}`,
    },
  };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const page = Math.max(Number(pageParam ?? "1"), 1);
  const { tag, posts, totalPages } = await getPostsByTag(slug, page, 4);
  const title = tag?.name ?? titleFromSlug(slug);

  return (
    <div className="education-page tag-page">
      <Header />

      <main>
        <section className="education-content-grid education-featured-modern tag-content-grid">
          <section className="education-archive-section" aria-labelledby="tag-archive-title">
            <div className="section-heading">
              <span className="kicker">Tagged Articles</span>
              <h1 id="tag-archive-title">{title}</h1>
              <p>{tag?.description || `Browse articles tagged ${title}.`}</p>
            </div>

            <div className="education-archive-grid">
              {posts.map((post) => (
                <ArticleCard post={post} key={post.id} />
              ))}
            </div>

            {!posts.length ? (
              <p className="archive-loading">Articles for this tag are temporarily unavailable. Please check back soon.</p>
            ) : null}

            <nav className="post-navigation" aria-label={`${title} tag pagination`}>
              {page > 1 ? <Link href={`/tag/${slug}?page=${page - 1}`}>Previous page</Link> : <span />}
              {page < totalPages ? <Link href={`/tag/${slug}?page=${page + 1}`}>View More</Link> : <span />}
            </nav>
          </section>

          <aside className="education-sidebar tag-sidebar">
            <NewsletterAdStack idPrefix={`tag-${slug}`} formClassName="sidebar-newsletter labeled" />
          </aside>
        </section>

        <AdBanner
          placement="home-bottom"
          idSuffix={`tag-after-archive-${slug}`}
          wrapClassName="archive-pagination-ad"
          variant="google-ad-slot--wide-banner"
        />

      </main>

      <Footer />
    </div>
  );
}
