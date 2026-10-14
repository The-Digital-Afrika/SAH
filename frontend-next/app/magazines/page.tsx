import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MagazineCard from "@/components/MagazineCard";
import NewsletterAdStack from "@/components/NewsletterAdStack";
import ResourceCards from "@/components/ResourceCards";
import SectionPageLayout from "@/components/SectionPageLayout";
import { getMagazinePosts } from "@/lib/wordpress";

export const metadata: Metadata = {
  title: "Magazines",
  description: "Read SA Homeschooling & Beyond magazine issues directly from the website.",
  alternates: {
    canonical: "/magazines",
  },
  openGraph: {
    title: "Magazines | SA Homeschooling & Beyond",
    description: "Read SA Homeschooling & Beyond magazine issues directly from the website.",
    url: "/magazines",
  },
};

export default async function MagazinesPage() {
  const magazines = await getMagazinePosts();

  return (
    <div className="magazines-page">
      <Header />

      <main className="magazines-main">
        <SectionPageLayout idPrefix="magazines" showFooterAd={false}>
          <section className="magazine-grid" aria-label="Magazine library">
            {magazines.length ? (
              <>
                {magazines.slice(0, 2).map((issue) => (
                  <MagazineCard issue={issue} key={`${issue.id}-${issue.slug}`} />
                ))}

                {magazines.length > 2 ? (
                  <div className="magazine-newsletter-break">
                    <NewsletterAdStack idPrefix="magazines-inline" className="magazine-newsletter-stack" fallbackAds />
                  </div>
                ) : null}

                {magazines.slice(2).map((issue) => (
                  <MagazineCard issue={issue} key={`${issue.id}-${issue.slug}`} />
                ))}
              </>
            ) : (
              <p className="archive-loading">Magazine issues are temporarily unavailable.</p>
            )}
          </section>

          <ResourceCards />
        </SectionPageLayout>
      </main>

      <Footer flush />
    </div>
  );
}
