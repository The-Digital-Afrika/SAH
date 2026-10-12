import Image from "next/image";
import Link from "next/link";
import {
  getArticleImage,
  getPostAuthor,
  getPostExcerpt,
  getPostTitle,
  getPrimaryCategory,
  isMagazineArticle,
  type WPPost,
} from "@/lib/wordpress";
import styles from "./HomeLeadStory.module.css";

type FeaturedStoryCardProps = {
  post: WPPost;
  home?: boolean;
};

export default function FeaturedStoryCard({ post, home = false }: FeaturedStoryCardProps) {
  const image = getArticleImage(post);
  const magazine = isMagazineArticle(post);
  const date = new Date(post.date);
  const publishedDate = Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat("en-ZA", {
    day: "numeric", month: "short", timeZone: "Africa/Johannesburg",
  }).format(date);

  return (
    <article className={`${styles.card}${home ? " home-lead-story" : ""}`}
      data-featured-story-card data-home-lead-card={home || undefined}>
      <Link className={styles.link} href={`/articles/${post.slug}`}>
        <div className={styles.media}>
          <Image className={`${styles.photo}${magazine ? ` ${styles.magazine}` : ""}`}
            src={image.src} alt={image.alt} fill sizes="(max-width: 1100px) 100vw, 768px" preload />
        </div>
        <div className={styles.content}>
          <div className={styles.metadata}>
            <span className={styles.category}>{magazine ? "Magazines" : getPrimaryCategory(post)}</span>
            {publishedDate ? <time dateTime={post.date}>{publishedDate}</time> : null}
          </div>
          <h2>{getPostTitle(post)}</h2>
          <p className={styles.excerpt}>{getPostExcerpt(post)}</p>
          <p className={styles.author}>by {getPostAuthor(post)}</p>
        </div>
      </Link>
    </article>
  );
}
