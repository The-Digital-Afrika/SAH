import Image from "next/image";
import Link from "next/link";
import { getArticleImage, getPostExcerpt, getPostTitle, getPrimaryCategory, isMagazineArticle, type WPPost } from "@/lib/wordpress";

type FeaturedPostsProps = {
  posts: WPPost[];
};

export default function FeaturedPosts({ posts }: FeaturedPostsProps) {
  const featured = posts.slice(0, 3);

  if (!featured.length) return null;

  return (
    <section className="home-section home-section--white">
      <div className="home-feature-mosaic">
        {featured.map((post, index) => {
          const image = getArticleImage(post);

          return (
            <article
              className={`topic-card${index === 0 ? " topic-card--wide" : ""}${isMagazineArticle(post) ? " topic-card--magazine" : ""}`}
              key={post.id}
            >
              <Link href={`/articles/${post.slug}`}>
                <Image src={image.src} alt={image.alt} width={image.width} height={image.height} />
                <span className="kicker">{getPrimaryCategory(post)}</span>
                <h3>{getPostTitle(post)}</h3>
                <p>{getPostExcerpt(post)}</p>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
