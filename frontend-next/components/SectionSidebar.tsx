import Link from "next/link";
import type { ReactNode } from "react";
import { getAdByPlacement, getPosts, getPostTitle } from "@/lib/wordpress";
import AdBanner from "./AdBanner";
import SidebarAdRail from "./SidebarAdRail";

type SectionSidebarProps = {
  idPrefix: string;
  children?: ReactNode;
};

export default async function SectionSidebar({ idPrefix, children }: SectionSidebarProps) {
  const [posts, sidebarAd, footerAd] = await Promise.all([
    getPosts({ perPage: 5 }),
    getAdByPlacement("article-sidebar"),
    getAdByPlacement("home-bottom"),
  ]);
  const titleId = `${idPrefix}-most-recent-title`;

  return (
    <aside className="section-sidebar" aria-label="Recent articles and advertisements">
      <section className="section-most-recent" aria-labelledby={titleId}>
        <h2 id={titleId}>Most Recent</h2>
        {posts.length ? (
          <ol>
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/articles/${post.slug}`}>{getPostTitle(post)}</Link>
              </li>
            ))}
          </ol>
        ) : (
          <p>Recent articles are temporarily unavailable.</p>
        )}
      </section>

      {children ?? (
        <AdBanner
          placement="article-sidebar"
          idSuffix={`${idPrefix}-rail-top`}
          wrapClassName="section-sidebar-ad"
          variant="google-ad-slot--medium-rect"
          fallback
        />
      )}

      <SidebarAdRail idPrefix={idPrefix} sidebarAd={sidebarAd} footerAd={footerAd} />
    </aside>
  );
}
