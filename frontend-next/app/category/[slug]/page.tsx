import type { Metadata } from "next";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import FeaturedMosaic from "@/components/FeaturedMosaic";
import FeaturedStoryCard from "@/components/FeaturedStoryCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterAdStack from "@/components/NewsletterAdStack";
import ResourceCards from "@/components/ResourceCards";
import SectionPageLayout from "@/components/SectionPageLayout";
import { getCategoryBySlug, getPostsByCategory } from "@/lib/wordpress";

type CategoryPageProps = {
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

function getCategoryKey(slug: string, name: string) {
  const normalizedName = name.toLowerCase();

  if (slug === "ask-dalena" || normalizedName.includes("dalena")) return "ask-dalena";
  if (slug === "parenting" || normalizedName.includes("parenting")) return "parenting";
  if (slug === "development" || normalizedName.includes("development")) return "development";
  if (slug === "cooking-bonding" || slug === "cooking-and-bonding" || normalizedName.includes("cooking")) {
    return "cooking-bonding";
  }

  return slug;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: titleFromSlug(slug),
      description: "Browse SA Homeschooling & Beyond category articles.",
    };
  }

  const description = category.description || `Browse ${category.name} articles from SA Homeschooling & Beyond.`;

  return {
    title: category.name,
    description,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
    openGraph: {
      title: `${category.name} | SA Homeschooling & Beyond`,
      description,
      url: `/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const [{ slug }, { page: pageParam }] = await Promise.all([params, searchParams]);
  const page = Math.max(Number(pageParam ?? "1"), 1);
  const { category, posts, totalPages } = await getPostsByCategory(slug, page, 4);
  const pageCategory = category ?? {
    id: 0,
    count: 0,
    name: titleFromSlug(slug),
    slug,
    description: "",
  };
  const categoryKey = getCategoryKey(slug, pageCategory.name);
  const useFeaturedCard = ["education", "development", "ask-dalena", "cooking-bonding", "parenting"].includes(categoryKey);

  return (
    <div className={`education-page category-index-page category-page--${categoryKey}`}>
      <Header />

      <main>
        <SectionPageLayout
          idPrefix={`category-${pageCategory.slug}`}
          newsletter={
            <NewsletterAdStack
              idPrefix={`category-${pageCategory.slug}`}
              formClassName="sidebar-newsletter labeled"
              fallbackAds
            />
          }
        >
          {useFeaturedCard ? (
            posts[0] ? <FeaturedStoryCard post={posts[0]} /> : null
          ) : <FeaturedMosaic posts={posts} className="page-featured-mosaic" showSecondary={false} />}

          <section className="education-content-grid education-featured-modern">
            <section className="news-section education-featured-list" aria-labelledby="category-archive-title">
              <div className="section-rule" />
              <h2 id="category-archive-title">Latest {pageCategory.name} Articles</h2>
              <div className="education-archive-grid">
                {posts.map((post) => (
                  <ArticleCard post={post} key={post.id} />
                ))}
              </div>
              {!posts.length ? (
                <p className="archive-loading">
                  {pageCategory.name} articles are temporarily unavailable. Please check back soon.
                </p>
              ) : null}
              <nav className="post-navigation" aria-label={`${pageCategory.name} pagination`}>
                {page > 1 ? <Link href={`/category/${pageCategory.slug}?page=${page - 1}`}>Previous page</Link> : <span />}
                {page < totalPages ? (
                  <Link href={`/category/${pageCategory.slug}?page=${page + 1}`}>View More</Link>
                ) : (
                  <span />
                )}
              </nav>
            </section>
          </section>

          <ResourceCards context={getCategoryKey(pageCategory.slug, pageCategory.name)} />
        </SectionPageLayout>
      </main>

      <Footer flush />
    </div>
  );
}
