import { getMagazinePdfReaderUrl, type MagazineIssue } from "@/lib/wordpress";
import styles from "./MagazineArticleReader.module.css";

export default function MagazineArticleReader({ issue }: { issue: MagazineIssue }) {
  const url = getMagazinePdfReaderUrl(issue.pdfUrl);
  if (!url) return null;
  return (
    <section className={styles.reader} aria-label={`Read ${issue.title}`}>
      <iframe src={`${url}#toolbar=1&navpanes=0`} title={`${issue.title} magazine reader`} />
      <a href={url} target="_blank" rel="noopener noreferrer">Open magazine in a new tab</a>
    </section>
  );
}
