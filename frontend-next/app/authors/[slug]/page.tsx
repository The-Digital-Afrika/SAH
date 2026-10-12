import type { Metadata } from "next";
import Link from "next/link";
import AdBanner from "@/components/AdBanner";
import ArticleCard from "@/components/ArticleCard";
import AuthorAvatar from "@/components/AuthorAvatar";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import {
  getAuthorBio,
  getAuthorBySlug,
  getAuthorEmail,
  getPostsByAuthor,
} from "@/lib/wordpress";

type AuthorPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) {
    return {
      title: "Author Temporarily Unavailable",
      description: "This SA Homeschooling author profile could not be loaded right now.",
    };
  }

  const description = getAuthorBio(author);

  return {
    title: author.name,
    description,
    alternates: {
      canonical: `/authors/${author.slug}`,
    },
    openGraph: {
      title: `${author.name} | SA Homeschooling & Beyond`,
      description,
      url: `/authors/${author.slug}`,
    },
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { slug } = await params;
  const author = await getAuthorBySlug(slug);

  if (!author) return <AuthorUnavailable slug={slug} />;

  const posts = await getPostsByAuthor(author.id, 24);
  const email = getAuthorEmail(author);

  return (
    <div className="directory-page">
      <Header />

      <main className="newsletter-page">
        <section className="author-header">
          <AuthorAvatar author={author} />
          <div>
            <span className="kicker">Author</span>
            <h1>{author.name}</h1>
            <p>{getAuthorBio(author)}</p>
            {email ? <Link href={`mailto:${email}`}>{email}</Link> : null}
          </div>
        </section>

        <section className="education-archive-section" aria-labelledby="author-articles-title">
          <div className="section-heading">
            <span className="kicker">Articles</span>
            <h2 id="author-articles-title">Articles by {author.name}</h2>
          </div>

          {posts.length ? (
            <div className="education-archive-grid">
              {posts.map((post) => (
                <ArticleCard post={post} key={post.id} />
              ))}
            </div>
          ) : (
            <p className="archive-loading">No published articles are available for this author yet.</p>
          )}
        </section>

        <AdBanner
          placement="home-bottom"
          idSuffix={`author-bottom-${author.slug}`}
          wrapClassName="archive-pagination-ad"
          variant="google-ad-slot--wide-banner"
        />
      </main>

      <Footer />
    </div>
  );
}

function AuthorUnavailable({ slug }: { slug: string }) {
  return (
    <div className="directory-page">
      <Header />

      <main className="newsletter-page">
        <section className="author-header">
          <div className="author-avatar" aria-hidden="true" />
          <div>
            <span className="kicker">Author</span>
            <h1>Author profile unavailable</h1>
            <p>This profile could not be loaded from WordPress right now. Please check back soon.</p>
            <Link href="/authors">Back to authors</Link>
          </div>
        </section>

        <section className="education-archive-section" aria-labelledby={`${slug}-author-empty-title`}>
          <div className="section-heading">
            <span className="kicker">Articles</span>
            <h2 id={`${slug}-author-empty-title`}>Articles unavailable</h2>
          </div>
          <p className="archive-loading">Published articles for this author are temporarily unavailable.</p>
        </section>

        <AdBanner
          placement="home-bottom"
          idSuffix={`author-unavailable-${slug}`}
          wrapClassName="archive-pagination-ad"
          variant="google-ad-slot--wide-banner"
        />
      </main>

      <Footer />
    </div>
  );
}
