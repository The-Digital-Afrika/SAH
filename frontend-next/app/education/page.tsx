import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import FeaturedStoryCard from "@/components/FeaturedStoryCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterAdStack from "@/components/NewsletterAdStack";
import SectionPageLayout from "@/components/SectionPageLayout";
import { getPostsByCategory } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Education Articles",
  description:
    "Browse SA Homeschooling articles about education pathways, learning support, matric planning, parenting, and development.",
  alternates: {
    canonical: "/education",
  },
  openGraph: {
    title: "Education Articles | SA Homeschooling & Beyond",
    description:
      "Browse SA Homeschooling articles about education pathways, learning support, matric planning, parenting, and development.",
    url: "/education",
  },
};

type ArticlesPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(Number(pageParam ?? "1"), 1);
  const { posts, totalPages } = await getPostsByCategory("education", page, 40);
  const weekly = posts.slice(1, 5);
  const archivePosts = posts.slice(5);

  return (
    <div className="education-page education-index-page">
      <Header />

      <main>
        <SectionPageLayout
          idPrefix="education"
          showFooterAd={false}
          newsletter={<NewsletterAdStack idPrefix="education" formClassName="sidebar-newsletter labeled" fallbackAds showAds={false} />}
        >
          {posts[0] ? <FeaturedStoryCard post={posts[0]} /> : null}

          <section className="weekly-section education-weekly-modern" aria-label="More education stories">
            {weekly.length ? (
              weekly.map((post) => <ArticleCard post={post} key={post.id} editorial />)
            ) : (
              <p className="archive-loading">Weekly stories are temporarily unavailable. Please check back soon.</p>
            )}
          </section>

          <section className="education-content-grid education-featured-modern">
            <section className="education-archive-section" aria-labelledby="education-archive-title">
              <div className="section-heading">
                <span className="kicker">Education Archive</span>
                <h2 id="education-archive-title">All Education Stories</h2>
              </div>
              <div className="education-archive-grid">
                {archivePosts.map((post) => (
                  <ArticleCard post={post} key={post.id} editorial />
                ))}
              </div>
              {!archivePosts.length ? (
                <p className="archive-loading">Articles could not be loaded right now. Please check back soon.</p>
              ) : null}
              <nav className="post-navigation" aria-label="Article pagination">
                {page > 1 ? <Link href={`/education?page=${page - 1}`}>Previous page</Link> : <span />}
                {page < totalPages ? <Link href={`/education?page=${page + 1}`}>View More</Link> : <span />}
              </nav>
            </section>
          </section>

        </SectionPageLayout>
      </main>

      <Footer flush />
    </div>
  );
}
