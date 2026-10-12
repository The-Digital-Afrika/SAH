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

type HeroProps = {
  posts: WPPost[];
};

export default function Hero({ posts }: HeroProps) {
  const lead = posts[0];
  const picks = posts.slice(1, 5);

  if (!lead) return null;

  const leadImage = getArticleImage(lead);

  return (
    <section className="home-hero-band" aria-label="Featured stories">
      <div className="home-hero-layout">
        <article className={isMagazineArticle(lead) ? "home-lead-story home-lead-story--magazine" : "home-lead-story"}>
          <Link href={`/articles/${lead.slug}`}>
            <Image
              src={leadImage.src}
              alt={leadImage.alt}
              width={leadImage.width}
              height={leadImage.height}
              priority
            />
            <div className="home-lead-copy">
              <span className="kicker">{getPrimaryCategory(lead)}</span>
              <h1>{getPostTitle(lead)}</h1>
              <p>{getPostExcerpt(lead)}</p>
              <span className="story-meta">by {getPostAuthor(lead)}</span>
            </div>
          </Link>
        </article>

        <aside className="editor-picks" aria-labelledby="editor-picks-title">
          <div className="section-rule" />
          <h2 id="editor-picks-title">Top Stories</h2>
          {picks.map((post) => {
            const image = getArticleImage(post);

            return (
              <Link
                className={isMagazineArticle(post) ? "pick-row pick-row--magazine" : "pick-row"}
                href={`/articles/${post.slug}`}
                key={post.id}
              >
                <Image src={image.src} alt="" width={180} height={120} />
                <span>
                  <strong>{getPostTitle(post)}</strong>
                  <em>{getPrimaryCategory(post)}</em>
                </span>
              </Link>
            );
          })}
        </aside>
      </div>
    </section>
  );
}
