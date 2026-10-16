import Image from "next/image";
import Link from "next/link";
import { getArticleImage, getPostExcerpt, getPostTitle, isMagazineArticle, type WPCategory, type WPPost } from "@/lib/wordpress";
import styles from "./CategorySection.module.css";

type CategorySectionProps = {
  category: Pick<WPCategory, "name"> & Partial<WPCategory>;
  posts: WPPost[];
};

export default function CategorySection({ category, posts }: CategorySectionProps) {
  if (!posts.length) return null;

  return (
    <section
      className={`home-section home-section--soft home-category-section--cards ${styles.cardSection}`}
      aria-label={`${category.name} articles`}
    >
      <div className="home-split home-category-grid">
        <div className="section-heading home-category-heading">
          <span className="kicker">{category.name}</span>
        </div>

        <div
          className="home-category-articles home-category-card-grid"
        >
          {posts.slice(0, 4).map((post) => {
            const image = getArticleImage(post);
            const articleClassName = "article-row-modern home-category-card";

            return (
              <Link
                className={isMagazineArticle(post) ? `${articleClassName} article-row-modern--magazine` : articleClassName}
                href={`/articles/${post.slug}`}
                key={post.id}
              >
                <Image src={image.src} alt="" width={image.width} height={image.height}
                  sizes="(max-width: 560px) 100vw, (max-width: 1100px) 50vw, 384px" />
                <span>
                  <strong>{getPostTitle(post)}</strong>
                  <em>{getPostExcerpt(post)}</em>
                </span>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
