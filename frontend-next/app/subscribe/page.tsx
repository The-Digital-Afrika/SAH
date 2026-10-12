import type { Metadata } from "next";
import AdBanner from "@/components/AdBanner";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import NewsletterForm from "@/components/NewsletterForm";
import ResourceCards from "@/components/ResourceCards";

export const metadata: Metadata = {
  title: "Newsletter",
  description: "Subscribe to SA Homeschooling & Beyond for fresh education and parenting stories in your inbox.",
  alternates: {
    canonical: "/subscribe",
  },
  openGraph: {
    title: "Newsletter | SA Homeschooling & Beyond",
    description: "Subscribe to SA Homeschooling & Beyond for fresh education and parenting stories in your inbox.",
    url: "/subscribe",
  },
};

export default function SubscribePage() {
  return (
    <div className="subscribe-page">
      <Header />

      <main className="newsletter-page">
        <section className="newsletter-panel">
          <NewsletterForm idPrefix="subscribe" className="compact-form" title="Join our community" headingLevel="h1" />
        </section>

        <AdBanner
          placement="subscribe-bottom"
          idSuffix="subscribe-before-resources"
          wrapClassName="archive-pagination-ad"
          variant="google-ad-slot--wide-banner"
        />

        <ResourceCards />
      </main>

      <Footer />
    </div>
  );
}
