import { getArticlePath } from "@/lib/article-path";
import { getMagazineReaderUrl, type MagazineIssue } from "@/lib/wordpress";
import Link from "next/link";
import styles from "./MagazineLibrary.module.css";

export default function MagazineCard({ issue }: { issue: MagazineIssue }) {
 const href = getMagazineReaderUrl(issue);
 const cover = issue.coverImage ? <img src={issue.coverImage.src} alt={issue.coverImage.alt || issue.title} loading="lazy" /> : <span>{issue.title}</span>;
 return <article className={styles.issue}>
  <h2>{issue.title}</h2>
  <p>{issue.description}</p>
  {href ? <a className={styles.cover} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Read ${issue.title}`}>{cover}</a> : <div className={styles.cover}>{cover}</div>}
  <div className={styles.actions}>
   {href ? <a href={href} target="_blank" rel="noopener noreferrer">Read magazine</a> : null}
   {issue.sourcePost ? <Link href={getArticlePath(issue.sourcePost)}>Read the magazine article</Link> : null}
  </div>
 </article>;
}
