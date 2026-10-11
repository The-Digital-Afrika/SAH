import Image from "next/image";
import Link from "next/link";
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
};

export default function ArticleCard({ post, className = "education-archive-card", imagePriority = false }: ArticleCardProps) {
  const image = getArticleImage(post);
  const articleClassName = isMagazineArticle(post) ? `${className} article-card--magazine` : className;

  return (
    <Link className={articleClassName} href={`/articles/${post.slug}`}>
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
