import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import AdSlot from "@/components/AdSlot";
import ArticleCard from "@/components/ArticleCard";
import AuthorAvatar from "@/components/AuthorAvatar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import NewsletterAdStack from "@/components/NewsletterAdStack";
import {
  getArticleImage,
  getAuthorBio,
  getPostAuthor,
  getPostBySlug,
  getPostAuthorProfile,
  getPostAuthorSlug,
  getPostCategories,
  getPostExcerpt,
  getPostTitle,
  getPosts,
  getPrimaryCategory,
} from "@/lib/wordpress";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Temporarily Unavailable",
      description: "This SA Homeschooling article could not be loaded right now.",
    };
  }

  const image = getArticleImage(post);
  const title = getPostTitle(post);
  const description = getPostExcerpt(post);

  return {
    title,
    description,
    alternates: {
      canonical: `/articles/${post.slug}`,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/articles/${post.slug}`,
      publishedTime: post.date,
      modifiedTime: post.modified,
      authors: [getPostAuthor(post)],
      images: [
        {
          url: image.src,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return <ArticleUnavailable slug={slug} />;

  const image = getArticleImage(post);
  const categories = getPostCategories(post);
  const author = getPostAuthorProfile(post);
  const authorSlug = getPostAuthorSlug(post);
  const authorHref = authorSlug ? `/authors/${authorSlug}` : "#";
  const pageBackgroundStyle = { "--page-bg-image": `url(${JSON.stringify(image.src)})` } as CSSProperties;
  const related = await getPosts({
    perPage: 3,
    categories: categories[0]?.id,
    exclude: post.id,
  });

  return (
    <div className="recipe-page article-page">
      <Header />

      <main className="recipe-layout article-layout article-layout--feature" style={pageBackgroundStyle}>
        <article className="recipe-article article-body article-feature-article">
          <figure className="article-feature-image">
            <Image src={image.src} alt={image.alt} width={image.width} height={image.height} priority />
          </figure>

          <div className="article-feature-card article-content-card">
            <header className="article-inline-heading">
              <div className="section-rule" />
              <p>{categories.map((category) => category.name).join(", ") || getPrimaryCategory(post)}</p>
              <h1>{getPostTitle(post)}</h1>
              <span className="article-byline">
                by <Link href={authorHref}>{getPostAuthor(post)}</Link>
              </span>
            </header>

            <div className="intro-box">
              <p>
                <em>{getPostExcerpt(post)}</em>
              </p>
            </div>

            <div dangerouslySetInnerHTML={{ __html: post.content.rendered }} />

            <AdSlot
              placement="article-inline"
              className="article-inline-ad-slot"
              wrapClassName="article-inline-ad"
              variant="google-ad-slot--article-inline-fit"
            />
          </div>
        </article>

        <aside className="recipe-sidebar article-sidebar article-sidebar--restored" aria-label="Article sidebar">
          <NewsletterForm
            idPrefix="article-hero-sidebar"
            className="sidebar-newsletter labeled article-hero-newsletter"
            title="Join our community"
          />
          <AdSlot
            placement="article-sidebar"
            idSuffix={`${post.slug}-sidebar-top`}
            className="article-side-ad-slot"
            wrapClassName="article-side-ad"
            variant="google-ad-slot--article-sidebar-fit"
          />
          <section className="latest-widget">
            <h2>Latest Stories</h2>
            {related.map((relatedPost) => (
              <Link href={`/articles/${relatedPost.slug}`} key={relatedPost.id}>
                {getPostTitle(relatedPost)}
              </Link>
            ))}
          </section>
          <AdSlot
            placement="article-sidebar"
            idSuffix={`${post.slug}-sidebar-bottom`}
            className="article-side-ad-slot"
            wrapClassName="article-side-ad"
            variant="google-ad-slot--article-sidebar-fit"
          />
        </aside>

        <section className="article-author-section" aria-label="Author">
          <div className="author-bio">
            <AuthorAvatar author={author} />
            <div>
              <h2>
                {getPostAuthor(post)} <span>Author</span>
              </h2>
              <p>{getAuthorBio(author)}</p>
              <Link href={authorHref}>More by {getPostAuthor(post)}</Link>
            </div>
          </div>
        </section>

        <div className="article-feature-card article-related-card">
          {related.length ? (
            <section className="education-archive-section" aria-labelledby="related-title">
              <div className="section-heading">
                <span className="kicker">Related Articles</span>
                <h2 id="related-title">More stories for you</h2>
              </div>
              <div className="education-archive-grid">
                {related.map((relatedPost) => (
                  <ArticleCard post={relatedPost} key={relatedPost.id} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ArticleUnavailable({ slug }: { slug: string }) {
  return (
    <div className="recipe-page article-page">
      <Header />

      <main className="recipe-layout article-layout">
        <article className="recipe-article article-body">
          <div className="intro-box">
            <p>
              This article is temporarily unavailable while the WordPress connection catches up. Please refresh shortly
              or browse the latest articles.
            </p>
          </div>
          <Link href="/articles">Back to articles</Link>
          <NewsletterAdStack idPrefix={`article-unavailable-${slug}`} formClassName="sidebar-newsletter labeled" />
        </article>
      </main>

      <Footer />
    </div>
  );
}
