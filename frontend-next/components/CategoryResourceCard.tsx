import Link from "next/link";
import { getPostTitle, type WPCategory, type WPPost } from "@/lib/wordpress";

const categoryTopics: Record<string, string[]> = {
  education: ["Matric planning", "Online schooling", "Learning support", "Subject choices"],
  parenting: ["Family routines", "Exam stress", "Motivation", "Wellbeing"],
  development: ["Thinking skills", "ADHD support", "Child development", "Learning confidence"],
  "cooking-bonding": ["Family recipes", "Kitchen learning", "Bonding activities", "Practical life skills"],
};

export default function CategoryResourceCard({ category, posts }: { category: WPCategory; posts: WPPost[] }) {
  const topics = categoryTopics[category.slug] ?? ["Latest stories", "Practical guides", "Family support", "Resources"];

  return (
    <aside className="resource-card resource-card--directory category-resource-card">
      <span className="kicker">{category.name}</span>
      <h3>More {category.name} stories</h3>
      <p>Browse the full archive of SA Homeschooling articles in this section.</p>
      <div className="category-card-block">
        <span className="topic-list-label">Popular topics</span>
        <div className="category-topic-grid">
          {topics.map(topic => <span key={topic}>{topic}</span>)}
        </div>
      </div>
      <div className="category-card-block">
        <span className="topic-list-label">Latest in this section</span>
        <div className="category-latest-list">
          {posts.slice(0, 2).map(post => (
            <Link href={`/articles/${post.slug}`} key={post.id}>{getPostTitle(post)}</Link>
          ))}
        </div>
      </div>
      <Link className="resource-card-action" href={`/category/${category.slug}`}>
        View all {category.name} articles
      </Link>
    </aside>
  );
}
