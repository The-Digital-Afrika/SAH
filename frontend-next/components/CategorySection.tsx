import ArticleCard from "./ArticleCard";
import { type WPCategory, type WPPost } from "@/lib/wordpress";
import styles from "./CategorySection.module.css";

type CategorySectionProps = {
  category: Pick<WPCategory, "name"> & Partial<WPCategory>;
  posts: WPPost[];
  limit?: number;
};

export default function CategorySection({ category, posts, limit = 4 }: CategorySectionProps) {
  if (!posts.length) return null;

  return (
    <section
      className={`home-section home-section--soft home-category-section--cards ${styles.cardSection}`}
      aria-label={`${category.name} articles`}
    >
      <div className="home-split home-category-grid">
        <div className="section-heading home-category-heading">
          <h2 className="kicker">{category.name}</h2>
        </div>

        <div
          className="home-category-articles home-category-card-grid"
        >
          {posts.slice(0, limit).map((post) => (
            <ArticleCard post={post} key={post.id} className="home-editorial-card" editorial />
          ))}
        </div>

      </div>
    </section>
  );
}
