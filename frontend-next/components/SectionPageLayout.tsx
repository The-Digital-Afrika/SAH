import type { ReactNode } from "react";
import SectionSidebar from "./SectionSidebar";

type SectionPageLayoutProps = {
  idPrefix: string;
  children: ReactNode;
  newsletter?: ReactNode;
  sidebarFeatures?: ReactNode[];
};

export default function SectionPageLayout({ idPrefix, children, newsletter, sidebarFeatures }: SectionPageLayoutProps) {
  return (
    <div className="section-page-layout">
      <div className="section-page-content">{children}</div>
      <SectionSidebar idPrefix={idPrefix} features={sidebarFeatures}>{newsletter}</SectionSidebar>
    </div>
  );
}
