import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import MagazineCard from "@/components/MagazineCard";
import styles from "@/components/MagazineLibrary.module.css";
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
          <section className={styles.library} aria-labelledby="magazine-library-title">
            <h1 id="magazine-library-title">Explore Our Magazines</h1>
            <div className={styles.grid}>
              {magazines.length ? magazines.map((issue) => (
                <MagazineCard issue={issue} key={issue.id + '-' + issue.slug} />
              )) : <p>Magazine issues are temporarily unavailable.</p>}
            </div>
          </section>

        </SectionPageLayout>
      </main>

      <Footer flush />
    </div>
  );
}
