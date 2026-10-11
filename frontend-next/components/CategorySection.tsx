import Image from "next/image";
import Link from "next/link";
import { getArticleImage, getPostExcerpt, getPostTitle, isMagazineArticle, type WPCategory, type WPPost } from "@/lib/wordpress";
import styles from "./CategorySection.module.css";

type CategorySectionProps = {
  category: WPCategory;
  posts: WPPost[];
};

export default function CategorySection({ category, posts }: CategorySectionProps) {
  if (!posts.length) return null;

  const topics = getCategoryTopics(category.slug);
  const useArticleCards = category.slug === "education" || category.slug === "development";

  return (
    <section
      className={`home-section home-section--soft${useArticleCards ? ` home-category-section--cards ${styles.cardSection}` : ""}`}
      aria-label={`${category.name} articles`}
    >
      <div className="home-split home-category-grid">
        <div className="section-heading home-category-heading">
          <span className="kicker">{category.name}</span>
        </div>

        <div
          className={
            useArticleCards
              ? "home-category-articles home-category-card-grid"
              : "article-stack home-category-articles"
          }
        >
          {posts.slice(0, 3).map((post) => {
            const image = getArticleImage(post);
            const articleClassName = useArticleCards ? "article-row-modern home-category-card" : "article-row-modern";

            return (
              <Link
                className={isMagazineArticle(post) ? `${articleClassName} article-row-modern--magazine` : articleClassName}
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
          })}
        </div>

        <aside className="resource-card resource-card--directory category-resource-card">
          <span className="kicker">{category.name}</span>
          <h3>More {category.name} stories</h3>
          <p>Browse the full archive of SA Homeschooling articles in this section.</p>

          <div className="category-card-block">
            <span className="topic-list-label">Popular topics</span>
            <div className="category-topic-grid">
              {topics.map((topic) => (
                <span key={topic}>
                  {topic}
                </span>
              ))}
            </div>
          </div>

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

          <Link className="resource-card-action" href={`/category/${category.slug}`}>
            View all {category.name} articles
          </Link>
        </aside>
      </div>
    </section>
  );
}

function getCategoryTopics(slug: string) {
  const topics: Record<string, string[]> = {
    education: ["Matric planning", "Online schooling", "Learning support", "Subject choices"],
    parenting: ["Family routines", "Exam stress", "Motivation", "Wellbeing"],
    development: ["Thinking skills", "ADHD support", "Child development", "Learning confidence"],
    "cooking-bonding": ["Family recipes", "Kitchen learning", "Bonding activities", "Practical life skills"],
  };

  return topics[slug] ?? ["Latest stories", "Practical guides", "Family support", "Resources"];
}
