import Image from "next/image";
import Link from "next/link";
import {
  getArticleImage,
  getPostAuthor,
  getPostTitle,
  getPrimaryCategory,
  isMagazineArticle,
  type WPPost,
} from "@/lib/wordpress";
import tileStyles from "./ImageStoryTile.module.css";

type FeaturedMosaicProps = {
  posts: WPPost[];
  className?: string;
  showSecondary?: boolean;
};

export default function FeaturedMosaic({ posts, className = "", showSecondary = true }: FeaturedMosaicProps) {
  const [lead, ...secondary] = posts.slice(0, 4);

  if (!lead) return null;

  const leadImage = getArticleImage(lead);

  return (
    <section className={`site-featured-mosaic ${className}`.trim()} aria-label="Featured stories">
      <article className={isMagazineArticle(lead) ? "site-featured-lead site-featured-lead--magazine" : "site-featured-lead"}>
        <Link href={`/articles/${lead.slug}`}>
          <Image src={leadImage.src} alt={leadImage.alt} width={leadImage.width} height={leadImage.height} priority />
          <div className="site-featured-copy">
            <h2>{getPostTitle(lead)}</h2>
            <p>by {getPostAuthor(lead)}</p>
          </div>
        </Link>
      </article>

      {showSecondary && secondary.length ? (
        <div className="site-featured-row">
          {secondary.map((post) => {
            const image = getArticleImage(post);

            return (
              <Link
                className={`site-featured-tile ${tileStyles.tile}${isMagazineArticle(post) ? " site-featured-tile--magazine" : ""}`}
                href={`/articles/${post.slug}`}
                key={post.id}
              >
                <Image src={image.src} alt={image.alt} width={image.width} height={image.height} />
                <span>{getPrimaryCategory(post)}</span>
                <h3>{getPostTitle(post)}</h3>
              </Link>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
