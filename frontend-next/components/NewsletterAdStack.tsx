import AdBanner from "./AdBanner";
import NewsletterForm from "./NewsletterForm";
import type { AdPlacement } from "@/lib/wordpress";

type NewsletterAdStackProps = {
  idPrefix: string;
  adPlacement?: AdPlacement;
  className?: string;
  formClassName?: string;
  title?: string;
  showKicker?: boolean;
  headingLevel?: "h1" | "h2";
  fallbackAds?: boolean;
};

export default function NewsletterAdStack({
  idPrefix,
  adPlacement = "article-sidebar",
  className = "",
  formClassName = "sidebar-newsletter labeled",
  title,
  showKicker,
  headingLevel,
  fallbackAds = false,
}: NewsletterAdStackProps) {
  const stackClassName = ["newsletter-ad-stack", className].filter(Boolean).join(" ");

  return (
    <div className={stackClassName}>
      <AdBanner
        placement={adPlacement}
        idSuffix={`${idPrefix}-newsletter-top`}
        wrapClassName="newsletter-stack-ad newsletter-stack-ad--top"
        variant="google-ad-slot--wide-banner"
        fallback={fallbackAds}
      />
      <NewsletterForm
        idPrefix={idPrefix}
        className={formClassName}
        title={title}
        showKicker={showKicker}
        headingLevel={headingLevel}
      />
      <AdBanner
        placement={adPlacement}
        idSuffix={`${idPrefix}-newsletter-bottom`}
        wrapClassName="newsletter-stack-ad newsletter-stack-ad--bottom"
        variant="google-ad-slot--wide-banner"
        fallback={fallbackAds}
      />
    </div>
  );
}
