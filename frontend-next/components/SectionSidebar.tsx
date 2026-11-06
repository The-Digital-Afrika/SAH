import Link from "next/link";
import type { ReactNode } from "react";
import { getAdByPlacement, getMagazinePosts, getPosts, getPostTitle } from "@/lib/wordpress";
import LatestMagazine from "./LatestMagazine";
import NewsletterForm from "./NewsletterForm";
import ResourceCardAd from "./ResourceCardAd";
import SidebarAdRail from "./SidebarAdRail";
import StickySidebar from "./StickySidebar";

type SectionSidebarProps = {
  idPrefix: string;
  children?: ReactNode;
  features?: ReactNode[];
  showFooterAd?: boolean;
  featureAdCount?: number;
  className?: string;
  independentScroll?: boolean;
  totalAds?: number;
};

export default async function SectionSidebar({ idPrefix, children, features, showFooterAd = true, featureAdCount = 0, className = "", independentScroll = false, totalAds }: SectionSidebarProps) {
  const standardFlow = idPrefix !== "magazines";
  const [posts, sidebarAd, footerAd, magazines] = await Promise.all([
    getPosts({ perPage: 5 }),
    getAdByPlacement("article-sidebar"),
    showFooterAd ? getAdByPlacement("home-bottom") : Promise.resolve(null),
    standardFlow && !features?.length ? getMagazinePosts() : Promise.resolve([]),
  ]);
  const titleId = `${idPrefix}-most-recent-title`;

  return (
    <StickySidebar className={`section-sidebar ${className}`} label="Magazine, newsletter, recent articles and advertisements" independentScroll={independentScroll}>
      {features?.length ? features : standardFlow ? <LatestMagazine issue={magazines[0]} /> : null}
      {standardFlow ? <>
        <ResourceCardAd id={`${idPrefix}-sidebar-top`} tall={false} />
        {children ?? <NewsletterForm idPrefix={`${idPrefix}-sidebar`} />}
        <ResourceCardAd id={`${idPrefix}-sidebar-bottom`} tall />
      </> : null}

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

      {!standardFlow ? children : null}

      <SidebarAdRail idPrefix={idPrefix} sidebarAd={sidebarAd} footerAd={footerAd}
        existingAdCount={featureAdCount + (standardFlow ? 2 : 0)} totalAds={totalAds} />
    </StickySidebar>
  );
}
