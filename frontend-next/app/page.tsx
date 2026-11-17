import type { Metadata } from "next";
import AdBanner from "@/components/AdBanner";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import CategorySection from "@/components/CategorySection";
import ArticleCard from "@/components/ArticleCard";
import FeaturedStoryCard from "@/components/FeaturedStoryCard";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import SectionPageLayout from "@/components/SectionPageLayout";
import magazineStyles from "@/components/HomeMagazineFeature.module.css";
import communityStyles from "@/components/HomeCommunitySignup.module.css";
import homeStyles from "@/components/HomeArticleGrids.module.css";
import {
  getMagazinePosts,
  getMagazineReaderUrl,
  getPosts,
  getPostsByCategory,
  type MagazineIssue,
} from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Home&School",
  description:
    "Education, parenting, development, magazine, and partner resources for South African homeschool families.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Home&School",
    description:
      "Education, parenting, development, magazine, and partner resources for South African homeschool families.",
    url: "/",
  },
};

export default async function Home() {
  const categoryConfigs = [
    {
      slug: "education",
      name: "Education",
      description: "Education stories and guides",
    },
    {
      slug: "parenting",
      name: "Parenting",
      description: "Parenting stories and support",
    },
    {
      slug: "development",
      name: "Development",
      description: "Development stories and guides",
    },
    {
      slug: "cooking-bonding",
      name: "Cooking & Bonding",
      description: "Cooking and bonding stories",
    },
  ];
  const [posts, magazines, partnerSection, ...categorySections] = await Promise.all([
    getPosts({ perPage: 40 }),
    getMagazinePosts(),
    getPostsByCategory("partner-2", 1, 8),
    ...categoryConfigs.map((category) => getPostsByCategory(category.slug, 1, 8)),
  ]);
  const featuredMagazine = magazines[0];
  const sidebarFeatures = [<HomeMagazineFeature issue={featuredMagazine} key="latest-magazine" />];

  return (
    <div className={`home-page modern-home ${homeStyles.page}`}>
      <Header />

      <main>
        <SectionPageLayout idPrefix="home" sidebarFeatures={sidebarFeatures}>
          <section className="home-editorial-showcase" aria-label="Featured homeschool stories">
            {posts[0] ? <FeaturedStoryCard post={posts[0]} home /> : null}

            <CategorySection category={{ name: "Partners" }} posts={partnerSection.posts} limit={8} />
            <CategorySection category={{ name: "Top stories" }} posts={posts.slice(0, 4)} />
            {!posts.length ? (
              <p className="archive-loading">Latest stories are temporarily unavailable. Please check back soon.</p>
            ) : null}
          </section>


          <AdBanner placement="home-middle" idSuffix="before-community" wrapClassName="home-ad-row modern-ad-row" fallback />

          <section className={communityStyles.section} data-home-community-signup aria-label="Community signup">
            <NewsletterForm
              idPrefix="home-community"
              className={`compact-form ${communityStyles.form}`}
              title="Join our community"
            />
          </section>


          <AdBanner placement="home-middle" idSuffix="before-categories"
            wrapClassName="home-ad-row modern-ad-row home-category-ad" fallback />

          {categorySections.map((section, index) => {
            const config = categoryConfigs[index];

            return section.category ? (
              <Fragment key={config.slug}>
                <CategorySection
                  category={{
                    ...section.category,
                    slug: config.slug,
                    name: config.name,
                    description: config.description,
                  }}
                  posts={section.posts}
                  limit={8}
                />
                {index < categorySections.length - 1 ? (
                  <AdBanner placement="home-middle" idSuffix={`category-${config.slug}`}
                    wrapClassName="home-ad-row modern-ad-row home-category-ad" fallback />
                ) : null}
              </Fragment>
            ) : null;
          })}


          <AdBanner placement="home-middle" idSuffix="before-resources"
            wrapClassName="home-ad-row modern-ad-row home-category-ad" fallback />

          <section className="home-section home-section--soft" aria-label="Education guides">
            <div className="home-split home-guides-grid home-guides-grid--articles-only">
              <div className="article-stack home-guides-articles">
                {posts.length ? (
                  posts.slice(8, 12).map(post => <ArticleCard key={post.id} post={post} className="home-guide-card" editorial />)
                ) : (
                  <p className="archive-loading">Education guides will appear here as soon as WordPress is reachable.</p>
                )}
              </div>

            </div>
          </section>

          <CategorySection category={{ name: "More stories" }} posts={posts.slice(12)} limit={28} />
        </SectionPageLayout>
      </main>

      <Footer flush />
    </div>
  );
}

function HomeMagazineFeature({ issue }: { issue?: MagazineIssue }) {
  const cover = issue?.coverImage;
  const href = issue ? getMagazineReaderUrl(issue) ?? "/magazines" : "/magazines";
  const target = href === "/magazines" ? undefined : "_blank";

  return (
    <section className={magazineStyles.feature} data-home-sidebar-magazine aria-labelledby="home-latest-magazine-title">
      <div className={magazineStyles.heading}>
        <h3 id="home-latest-magazine-title">Latest Home &amp; School</h3>
        <p>Read your favourite magazine in a convenient PDF form.</p>
      </div>
      {cover ? (
        <Link className={magazineStyles.cover} href={href} target={target} rel={target ? "noopener noreferrer" : undefined}>
          <Image src={cover.src} alt={cover.alt} width={cover.width} height={cover.height}
            sizes="(max-width: 1100px) calc(100vw - 32px), 300px" />
        </Link>
      ) : null}
      <div className={magazineStyles.action}>
        <Link className={magazineStyles.read} href={href} target={target} rel={target ? "noopener noreferrer" : undefined}>Read now</Link>
      </div>
    </section>
  );
}
