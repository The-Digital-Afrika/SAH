import type { CSSProperties } from "react";
import { getMagazineReaderUrl, type MagazineIssue } from "@/lib/wordpress";

type MagazineViewerProps = {
  issue: MagazineIssue;
};

export default function MagazineViewer({ issue }: MagazineViewerProps) {
  const viewerUrl = getMagazineReaderUrl(issue);
  const cover = issue.coverImage;
  const coverStyle = cover
    ? ({
        "--magazine-cover-image": `url("${cover.src}")`,
      } as CSSProperties)
    : undefined;
  const preview = (
    <>
      <div className="magazine-preview__book" style={coverStyle}>
        <div
          className={`magazine-preview__cover${cover ? "" : " magazine-preview__cover--fallback"}`}
          role="img"
          aria-label={cover?.alt ?? `${issue.title} cover`}
        >
          {!cover ? (
            <>
              <span>SA Homeschooling &amp; Beyond</span>
              <strong>{issue.title}</strong>
            </>
          ) : null}
        </div>
        <span className="magazine-flip-page magazine-flip-page--one" aria-hidden="true" />
        <span className="magazine-flip-page magazine-flip-page--two" aria-hidden="true" />
        <span className="magazine-flip-page magazine-flip-page--three" aria-hidden="true" />
      </div>
      <span className="magazine-preview-fallback">{issue.title}</span>
    </>
  );

  if (!viewerUrl) {
    return (
      <div className="magazine-preview">
        {preview}
      </div>
    );
  }

  return (
    <a className="magazine-preview magazine-open" href={viewerUrl} aria-label={`Open ${issue.title}`} target="_blank" rel="noreferrer">
      {preview}
    </a>
  );
}
