import ArticleCard from "./ArticleCard";
import { getPosts } from "@/lib/wordpress";
import styles from "./MoreStories.module.css";

export default async function MoreStories({ exclude = [], count = 32 }: { exclude?: number[]; count?: number }) {
  const excluded = new Set(exclude);
  const posts = (await getPosts({ perPage: Math.min(100, count + exclude.length), exclude }))
    .filter(post => !excluded.has(post.id)).slice(0, count);
  if (!posts.length) return null;
  return (
    <section className={styles.section} aria-label="More from Home and School">
      <h2>More from Home&amp;School</h2>
      <div className={styles.grid}>
        {posts.map(post => <ArticleCard post={post} key={post.id} className="more-story-card" editorial />)}
      </div>
    </section>
  );
}
