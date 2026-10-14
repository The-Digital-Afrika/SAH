import type { ReactNode } from "react";
import SectionSidebar from "./SectionSidebar";

type SectionPageLayoutProps = {
  idPrefix: string;
  children: ReactNode;
  newsletter?: ReactNode;
  sidebarFeatures?: ReactNode[];
  showFooterAd?: boolean;
};

export default function SectionPageLayout({ idPrefix, children, newsletter, sidebarFeatures, showFooterAd = true }: SectionPageLayoutProps) {
  return (
    <div className="section-page-layout">
      <div className="section-page-content">{children}</div>
      <SectionSidebar idPrefix={idPrefix} features={sidebarFeatures} showFooterAd={showFooterAd}>{newsletter}</SectionSidebar>
    </div>
  );
}
