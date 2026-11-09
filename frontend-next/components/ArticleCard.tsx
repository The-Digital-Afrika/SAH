import { getArticlePath } from "@/lib/article-path";
import Image from "next/image";
import Link from "next/link";
import styles from "./EditorialCard.module.css";
import {
  formatPostDate,
  getArticleImage,
  getPostAuthor,
  getPostExcerpt,
  getPostTitle,
  getPrimaryCategory,
  isMagazineArticle,
  type WPPost,
} from "@/lib/wordpress";

type ArticleCardProps = {
  post: WPPost;
  className?: string;
  imagePriority?: boolean;
  editorial?: boolean;
};

export default function ArticleCard({ post, className = "education-archive-card", imagePriority = false, editorial = true }: ArticleCardProps) {
  const image = getArticleImage(post);
  const articleClassName = isMagazineArticle(post) ? `${className} article-card--magazine` : className;

  if (editorial) {
    return (
      <Link className={`${articleClassName} ${styles.card}`} href={getArticlePath(post)}>
        <Image src={image.src} alt={image.alt} width={image.width} height={image.height} priority={imagePriority}
          sizes="(max-width: 560px) 100vw, (max-width: 1100px) 50vw, 384px" />
        <div className={styles.copy}>
          <span className={styles.category}>{getPrimaryCategory(post)}</span>
          <h3 className={styles.title}>{getPostTitle(post)}</h3>
          <p className={styles.excerpt}>{getPostExcerpt(post)}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link className={articleClassName} href={getArticlePath(post)}>
      <Image src={image.src} alt={image.alt} width={image.width} height={image.height} priority={imagePriority} />
      <span className="kicker">{getPrimaryCategory(post)}</span>
      <h3>{getPostTitle(post)}</h3>
      <p>{getPostExcerpt(post)}</p>
      <strong>
        by {getPostAuthor(post)} / {formatPostDate(post.date)}
      </strong>
    </Link>
  );
}
