import Link from "next/link";
import { Fragment } from "react";
import { getArticlePath } from "@/lib/article-path";
import { getMagazinePosts, getPostTitle, type WPPost } from "@/lib/wordpress";
import AdBanner from "./AdBanner";
import ArticleCard from "./ArticleCard";
import FeaturedStoryCard from "./FeaturedStoryCard";
import LatestMagazine from "./LatestMagazine";
import NewsletterForm from "./NewsletterForm";

export default async function MobileSectionFeed({ posts, title, idPrefix, page, totalPages, href }: { posts: WPPost[]; title: string; idPrefix: string; page: number; totalPages: number; href: string }) {
  const magazines = await getMagazinePosts();
  const pairs = Array.from({ length: Math.ceil(Math.min(10, Math.max(0, posts.length - 1)) / 2) }, (_, index) => posts.slice(1 + index * 2, 3 + index * 2));
  const ad = (key: string) => <AdBanner placement="home-middle" idSuffix={`${idPrefix}-mobile-${key}`} wrapClassName="mobile-section-ad" fallback />;
  return (
    <div className="mobile-section-feed" aria-label={`${title} articles`}>
      {posts[0] && <FeaturedStoryCard post={posts[0]} />}
      <LatestMagazine issue={magazines[0]} />
      {ad("after-magazine")}
      {pairs.map((pair, index) => (
        <Fragment key={pair[0].id}>
          <section className="mobile-section-pair" aria-label={`${title} articles ${index * 2 + 2} to ${index * 2 + pair.length + 1}`}>
            {pair.map(post => <ArticleCard key={post.id} post={post} editorial />)}
          </section>
          {index === 0 && <NewsletterForm idPrefix={`${idPrefix}-mobile-community`} title="Join our community" />}
          {ad(`pair-${index + 1}`)}
          {index === 1 && <>
            <section className="section-most-recent" aria-labelledby={`${idPrefix}-mobile-recent-title`}>
              <h2 id={`${idPrefix}-mobile-recent-title`}>Most Recent</h2>
              <ol>{posts.slice(0, 5).map(post => <li key={post.id}><Link href={getArticlePath(post)}>{getPostTitle(post)}</Link></li>)}</ol>
            </section>
            {ad("after-recent")}
          </>}
        </Fragment>
      ))}
      {posts.length > 11 && <section className="mobile-section-pair" aria-label={`More ${title} articles`}>
        <h2>More articles</h2>
        {posts.slice(11).map(post => <ArticleCard key={post.id} post={post} editorial />)}
      </section>}
      {!posts.length && <p>Articles are temporarily unavailable. Please try again shortly.</p>}
      <nav className="post-navigation" aria-label={`${title} mobile pagination`}>
        {page > 1 && <Link href={`${href}?page=${page - 1}`}>Previous page</Link>}
        {page < totalPages && <Link href={`${href}?page=${page + 1}`}>View More</Link>}
      </nav>
    </div>
  );
}
