import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import AuthorAvatar from "@/components/AuthorAvatar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import NewsletterAdStack from "@/components/NewsletterAdStack";
import SectionSidebar from "@/components/SectionSidebar";
import ResourceCardAd from "@/components/ResourceCardAd";
import ArticleContentAds from "@/components/ArticleContentAds";
import AdBanner from "@/components/AdBanner";
import LatestMagazine from "@/components/LatestMagazine";
import CommentForm from "@/components/CommentForm";
import MagazineArticleReader from "@/components/MagazineArticleReader";
import { magazineArticleContent } from "@/lib/magazine-content";
import styles from "@/components/ArticlePage.module.css";
import {
  getArticleImage,
  getAdjacentPosts,
  getMagazinePosts,
  getMagazineIssueForPost,
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
  const category = getPrimaryCategory(post);
  const magazineIssue = getMagazineIssueForPost(post);
  const author = getPostAuthorProfile(post);
  const authorSlug = getPostAuthorSlug(post);
  const authorHref = authorSlug ? `/authors/${authorSlug}` : "/authors";
  const [related, magazines, adjacent] = await Promise.all([
    getPosts({ perPage: 4, categories: getPostCategories(post)[0]?.id, exclude: post.id }),
    getMagazinePosts(),
    getAdjacentPosts(post),
  ]);
  const inlineAds = [0, 1, 2].map(index => (
    <ResourceCardAd key={index} id={`${post.slug}-inline-${index}`} tall={false} />
  ));
  return (
    <div className={`article-redesign ${styles.page}`}>
      <Header />
      <main className={`section-page-layout ${styles.layout}`}>
        <div className={styles.column}>
          <article className={styles.article}>
            <Image className={styles.hero} src={image.src} alt={image.alt} width={image.width} height={image.height}
              sizes="(max-width: 760px) 100vw, 620px" preload />
            <div className={styles.copy}>
              <header className={styles.heading}>
                <p className={styles.category}>{category}</p>
                <h1>{getPostTitle(post)}</h1>
              </header>
              {magazineIssue ? <MagazineArticleReader issue={magazineIssue} /> : null}
              <p className={styles.intro}><em>{getPostExcerpt(post)}</em></p>
              <ArticleContentAds html={magazineIssue ? magazineArticleContent(post.content.rendered) : post.content.rendered} ads={inlineAds} className={styles.body} />
              <nav className={styles.navigation} aria-label="Previous and next articles">
                {adjacent.previous ? <Link href={`/articles/${adjacent.previous.slug}`} title={getPostTitle(adjacent.previous)}>Previous article</Link> : <span />}
                {adjacent.next ? <Link href={`/articles/${adjacent.next.slug}`} title={getPostTitle(adjacent.next)}>Next article</Link> : <span />}
              </nav>
              <section className={styles.author} aria-label="About the author">
                <AuthorAvatar author={author} size={96} />
                <div>
                  <h2>{getPostAuthor(post)}</h2>
                  <em>Author</em>
                  <p>{getAuthorBio(author)}</p>
                  <Link href={authorHref}>More by {getPostAuthor(post)}</Link>
                </div>
              </section>
            </div>
          </article>
          {related.length ? (
            <section className={styles.related} aria-labelledby="related-title">
              <h2 id="related-title">Related articles</h2>
              <div className={styles.relatedGrid}>{related.map(relatedPost => <ArticleCard post={relatedPost} key={relatedPost.id} className="related-editorial-card" editorial />)}</div>
            </section>
          ) : null}
          {!post.source_origin ? <>
            <AdBanner
              placement="article-inline"
              idSuffix={`${post.slug}-before-comments`}
              wrapClassName="article-comments-banner"
              variant="google-ad-slot--leaderboard-sm"
            />
            <CommentForm postId={post.id} />
          </> : null}
        </div>
        <SectionSidebar idPrefix={`article-${post.slug}`} className={styles.sidebar} independentScroll={Boolean(magazineIssue)} totalAds={magazineIssue ? 7 : 12}
          features={[<LatestMagazine issue={magazines[0]} key="magazine" />]}>
          <NewsletterForm idPrefix={`article-${post.id}`} className={styles.newsletter} title="Join our community" />
        </SectionSidebar>
      </main>
      <Footer />
    </div>
  );
}

function ArticleUnavailable({ slug }: { slug: string }) {
  return (
    <div className={`article-redesign ${styles.page}`}>
      <Header />
      <main className={`section-page-layout ${styles.layout}`}>
        <article className={styles.article}>
          <div className={styles.copy}><h1>Article temporarily unavailable</h1><p>This article could not be loaded from WordPress. Please refresh shortly.</p><Link href="/articles">Browse education articles</Link></div>
        </article>
        <SectionSidebar idPrefix={`article-unavailable-${slug}`}>
          <NewsletterAdStack idPrefix={`article-unavailable-${slug}`} formClassName={styles.newsletter} showAds={false} />
        </SectionSidebar>
      </main>
      <Footer />
    </div>
  );
}
