import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import AdBanner from "@/components/AdBanner";
import CategorySection from "@/components/CategorySection";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import SectionPageLayout from "@/components/SectionPageLayout";
import SectionIntro from "@/components/SectionIntro";
import tileStyles from "@/components/ImageStoryTile.module.css";
import magazineStyles from "@/components/HomeMagazineFeature.module.css";
import {
  getArticleImage,
  getMagazinePosts,
  getPostAuthor,
  getPostExcerpt,
  getPostTitle,
  getPosts,
  getPostsByCategory,
  getPrimaryCategory,
  isMagazineArticle,
  type MagazineIssue,
  type WPPost,
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
  const [posts, magazines, ...categorySections] = await Promise.all([
    getPosts({ perPage: 12 }),
    getMagazinePosts(),
    ...categoryConfigs.map((category) => getPostsByCategory(category.slug, 1, 3)),
  ]);
  const featuredMagazine = magazines[0];

  return (
    <div className="home-page modern-home">
      <AdBanner
        placement="home-top"
        wrapClassName="ad-strip top-ad home-menu-ad"
        variant="google-ad-slot--home-top-compact"
      />

      <Header />

      <main>
        <SectionPageLayout idPrefix="home">
          <SectionIntro section="home" />
          <section className="home-editorial-showcase" aria-label="Featured homeschool stories">
            {posts[0] ? <HomeLeadStory post={posts[0]} /> : null}

            <div className="home-card-row">
              {posts.slice(1, 4).map((post) => (
                <HomeImageTile post={post} key={post.id} />
              ))}
            </div>

            <section className="home-top-stories-panel home-top-stories--expanded" aria-labelledby="home-top-stories-title">
              <div className="section-rule" />
              <h2 id="home-top-stories-title">Top stories</h2>
              {posts.length ? (
                <div className="home-top-stories-grid">
                  {posts.slice(0, 3).map((post) => (
                    <HomeTopStory post={post} key={post.id} />
                  ))}
                </div>
              ) : (
                <p className="archive-loading">Latest stories are temporarily unavailable. Please check back soon.</p>
              )}
            </section>
          </section>

          <AdBanner placement="home-middle" wrapClassName="home-ad-row modern-ad-row" fallback />

          <section className="home-community-magazines" aria-label="Community signup and magazines">
            <aside className={`home-magazine-feature home-community-magazine ${magazineStyles.feature}`}>
              {featuredMagazine ? (
                <HomeMagazineFeature issue={featuredMagazine} />
              ) : (
                <Link className="home-magazine-feature__card" href="/magazines">
                  <span className="kicker">Magazines</span>
                  <h3>Browse the SA Homeschooling magazine archive</h3>
                  <p>Open uploaded PDF issues directly from the website.</p>
                </Link>
              )}
            </aside>

            <aside className="newsletter-card home-community-card">
              <NewsletterForm
                idPrefix="home-community"
                className="newsletter-card-form"
                title="Join our community"
              />
            </aside>
          </section>

          <AdBanner
            placement="home-middle"
            fallback
            idSuffix="before-categories"
            wrapClassName="home-ad-row modern-ad-row home-category-ad home-before-categories-ad"
          />

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
                />
                {index < categorySections.length - 1 ? (
                  <AdBanner
                    placement="home-middle"
                    fallback
                    idSuffix={`category-${config.slug}`}
                    wrapClassName="home-ad-row modern-ad-row home-category-ad"
                  />
                ) : null}
              </Fragment>
            ) : null;
          })}

          <AdBanner
            placement="home-middle"
            fallback
            idSuffix="before-resources"
            wrapClassName="home-ad-row modern-ad-row home-category-ad home-before-resources-ad"
          />

          <section className="home-section home-section--soft" aria-labelledby="guides-title">
            <div className="home-split home-guides-grid home-guides-grid--articles-only">
              <div className="section-heading home-guides-heading">
                <h2 id="guides-title">Education pathways, learning support, and future planning</h2>
              </div>

              <div className="article-stack home-guides-articles">
                {posts.length ? (
                  posts.slice(8, 12).map((post) => {
                    const image = getArticleImage(post);

                    return (
                      <Link
                        className={isMagazineArticle(post) ? "article-row-modern article-row-modern--magazine" : "article-row-modern"}
                        href={`/articles/${post.slug}`}
                        key={post.id}
                      >
                        <Image src={image.src} alt="" width={160} height={110} />
                        <span>
                          <strong>{getPostTitle(post)}</strong>
                          <em>{getPostExcerpt(post)}</em>
                        </span>
                      </Link>
                    );
                  })
                ) : (
                  <p className="archive-loading">Education guides will appear here as soon as WordPress is reachable.</p>
                )}
              </div>

              <EducationPathwaysCard posts={posts.slice(8, 12)} />
            </div>
          </section>

          <section className="home-section home-section--white" aria-labelledby="resources-title">
            <div className="section-heading">
              <span className="kicker">Resources</span>
              <h2 id="resources-title">Magazines, partners, and family activities</h2>
            </div>

            <div className="resource-grid">
              <Link className="resource-card resource-card--magazine" href="/magazines">
                <span className="kicker">Magazines</span>
                <h3>Browse the SA Homeschooling magazine archive</h3>
                <p>Open uploaded PDF issues directly from the website.</p>
              </Link>
              <Link className="resource-card resource-card--directory" href="/directory">
                <span className="kicker">Partners</span>
                <h3>Find learning providers and education partners</h3>
                <p>Explore schools, resource centres, olympiads, study guides, and curriculum support partners.</p>
              </Link>
              <Link className="resource-card resource-card--recipes" href="/category/cooking-bonding">
                <span className="kicker">Parenting</span>
                <h3>Cook, connect, and learn together</h3>
                <p>Family-friendly recipes that double as practical homeschool activities.</p>
              </Link>
            </div>
          </section>

        </SectionPageLayout>
      </main>

      <Footer flush />
    </div>
  );
}

function HomeLeadStory({ post }: { post: WPPost }) {
  const image = getArticleImage(post);

  return (
    <article
      className={
        isMagazineArticle(post)
          ? "home-lead-story home-lead-story--compact home-lead-story--magazine"
          : "home-lead-story home-lead-story--compact"
      }
    >
      <Link href={`/articles/${post.slug}`}>
        <Image src={image.src} alt={image.alt} width={image.width} height={image.height} />
        <div className="home-lead-copy">
          <h2>{getPostTitle(post)}</h2>
          <p>by {getPostAuthor(post)}</p>
        </div>
      </Link>
    </article>
  );
}

function HomeImageTile({ post }: { post: WPPost }) {
  const image = getArticleImage(post);

  return (
    <Link className={`home-image-tile ${tileStyles.tile}${isMagazineArticle(post) ? " home-image-tile--magazine" : ""}`} href={`/articles/${post.slug}`}>
      <Image src={image.src} alt={image.alt} width={image.width} height={image.height} />
      <span className="home-image-tile-category">{getPrimaryCategory(post)}</span>
      <h3>{getPostTitle(post)}</h3>
    </Link>
  );
}

function HomeTopStory({ post }: { post: WPPost }) {
  const image = getArticleImage(post);

  return (
    <Link className="home-top-story" href={`/articles/${post.slug}`}>
      <span className={isMagazineArticle(post) ? "home-top-story-media home-top-story-media--magazine" : "home-top-story-media"}>
        <Image src={image.src} alt="" fill sizes="(max-width: 620px) 100vw, (max-width: 920px) 50vw, 33vw" />
      </span>
      <span className="home-top-story-copy">
        <strong>{getPostTitle(post)}</strong>
        <em>
          {getPrimaryCategory(post)} / by {getPostAuthor(post)}
        </em>
        <p>{getPostExcerpt(post)}</p>
      </span>
    </Link>
  );
}

function HomeMagazineFeature({ issue }: { issue: MagazineIssue }) {
  const cover = issue.coverImage;

  return (
    <Link className={`home-magazine-feature__card ${magazineStyles.card}`} href="/magazines">
      <span className="kicker">Magazines</span>
      <h3>{issue.title}</h3>
      {cover ? (
        <Image
          className="home-magazine-feature__cover"
          src={cover.src}
          alt={cover.alt}
          width={cover.width}
          height={cover.height}
        />
      ) : null}
      <p>{issue.description}</p>
      <span className="home-magazine-feature__cta">Browse magazines</span>
    </Link>
  );
}

function EducationPathwaysCard({ posts }: { posts: WPPost[] }) {
  const topics = ["Matric planning", "Online schooling", "Learning support", "Subject choices"];

  return (
    <aside className="resource-card resource-card--directory category-resource-card education-pathways-card">
      <span className="kicker">Education</span>
      <h3>More education pathways</h3>
      <p>Browse planning guides, learning support articles, and practical resources for South African homeschool families.</p>

      <div className="category-card-block">
        <span className="topic-list-label">Popular topics</span>
        <div className="category-topic-grid">
          {topics.map((topic) => (
            <span key={topic}>{topic}</span>
          ))}
        </div>
      </div>

      {posts.length ? (
        <div className="category-card-block">
          <span className="topic-list-label">Latest in this section</span>
          <div className="category-latest-list">
            {posts.slice(0, 2).map((post) => (
              <Link href={`/articles/${post.slug}`} key={post.id}>
                {getPostTitle(post)}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <Link className="resource-card-action" href="/category/education">
        View all Education articles
      </Link>
    </aside>
  );
}

