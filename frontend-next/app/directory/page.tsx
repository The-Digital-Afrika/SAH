import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import SectionPageLayout from "@/components/SectionPageLayout";
import MoreStories from "@/components/MoreStories";
import { partners } from "@/lib/partners";

export const metadata: Metadata = {
  title: "Partners",
  description: "Find learning providers, resource centres, study guides, and education partners for homeschool families.",
  alternates: {
    canonical: "/directory",
  },
  openGraph: {
    title: "Partners | SA Homeschooling & Beyond",
    description: "Find learning providers, resource centres, study guides, and education partners for homeschool families.",
    url: "/directory",
  },
};

export default async function DirectoryPage() {

  return (
    <div className="directory-page">
      <Header />

      <main className="directory-section-page">
        <SectionPageLayout idPrefix="directory">
        <section className="directory-list" aria-label="Partner listings">
          {partners.map((partner) => (
            <article className="directory-card" key={partner.slug}>
              <Image className="directory-logo" src={partner.logo} alt={`${partner.name} logo`} width={220} height={120} />
              <h2>{partner.name}</h2>
              <p>{partner.shortDescription}</p>
              <div className="directory-card-actions">
                <Link className="directory-readmore-link" href={`/directory/${partner.slug}`}>
                  View more
                </Link>
                {partner.website ? (
                  <a
                    className="directory-website-link"
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit ${partner.name} official website`}
                  >
                    Visit Website
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </section>

          <MoreStories />
        </SectionPageLayout>
      </main>

      <Footer />
    </div>
  );
}
