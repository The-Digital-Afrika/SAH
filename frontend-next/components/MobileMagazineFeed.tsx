import { Fragment } from "react";
import Link from "next/link";
import { getMagazineReaderUrl, type MagazineIssue } from "@/lib/wordpress";
import AdBanner from "./AdBanner";
import LatestMagazine from "./LatestMagazine";
import MagazineCard from "./MagazineCard";
import FeaturedStoryCard from "./FeaturedStoryCard";
import NewsletterForm from "./NewsletterForm";
import styles from "./MobileMagazineFeed.module.css";

export default function MobileMagazineFeed({ magazines }: { magazines: MagazineIssue[] }) {
  const lead = magazines.find(issue => issue.sourcePost)?.sourcePost;
  const archive = magazines.slice(1);
  const pairs = Array.from({ length: Math.ceil(Math.min(10, archive.length) / 2) }, (_, index) => archive.slice(index * 2, index * 2 + 2));
  const ad = (key: string) => <AdBanner placement="home-middle" idSuffix={`magazines-mobile-${key}`} wrapClassName={styles.ad} fallback />;
  return (
    <div className={styles.feed} aria-label="Magazine archive">
      {lead && <FeaturedStoryCard post={lead} />}
      <LatestMagazine issue={magazines[0]} />
      {ad("after-latest")}
      {pairs.map((pair, index) => <Fragment key={pair[0].id + pair[0].slug}>
        <section className={styles.pair} aria-label={`Magazine issues ${index * 2 + 2} to ${index * 2 + pair.length + 1}`}>
          {pair.map(issue => <MagazineCard key={issue.id + issue.slug} issue={issue} />)}
        </section>
        {index === 0 && <NewsletterForm idPrefix="magazines-mobile-community" title="Join our community" />}
        {ad(`pair-${index + 1}`)}
        {index === 1 && <>
          <section className="section-most-recent" aria-labelledby="magazines-mobile-recent-title">
            <h2 id="magazines-mobile-recent-title">Most Recent</h2>
            <ol>{magazines.slice(0, 5).map(issue => <li key={issue.id + issue.slug}><Link href={getMagazineReaderUrl(issue) ?? "/magazines"}>{issue.title}</Link></li>)}</ol>
          </section>
          {ad("after-recent")}
        </>}
      </Fragment>)}
      {archive.length > 10 && <section className={styles.pair} aria-label="More magazines">
        <h2>More magazines</h2>
        {archive.slice(10).map(issue => <MagazineCard key={issue.id + issue.slug} issue={issue} />)}
      </section>}
      {!magazines.length && <p>Magazine issues are temporarily unavailable.</p>}
    </div>
  );
}
