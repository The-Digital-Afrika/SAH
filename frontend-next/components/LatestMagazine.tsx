import Image from "next/image";
import Link from "next/link";
import { getMagazineReaderUrl, type MagazineIssue } from "@/lib/wordpress";
import styles from "./HomeMagazineFeature.module.css";

export default function LatestMagazine({ issue }: { issue?: MagazineIssue }) {
  if (!issue?.coverImage) return null;
  const cover = issue.coverImage;
  const href = getMagazineReaderUrl(issue) ?? "/magazines";
  return (
    <section className={styles.feature} aria-label="Latest Home and School magazine">
      <div className={styles.heading}>
        <h3>Latest Home &amp; School</h3>
        <p>Read your favourite magazine in a convenient PDF format.</p>
      </div>
      <Link className={styles.cover} href={href} target={href.startsWith("/magazines") ? undefined : "_blank"} rel="noopener noreferrer">
        <Image src={cover.src} alt={cover.alt} width={cover.width} height={cover.height} sizes="260px" />
      </Link>
      <div className={styles.action}><Link className={styles.read} href={href} target="_blank" rel="noopener noreferrer">Read now</Link></div>
    </section>
  );
}
