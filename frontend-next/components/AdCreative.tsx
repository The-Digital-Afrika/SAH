import type { SiteAd } from "@/lib/wordpress";
import GoogleAdUnit from "./GoogleAdUnit";
import HouseAd from "./HouseAd";

type AdCreativeProps = {
  ad: SiteAd;
  className?: string;
  idSuffix?: string;
  wrapClassName?: string;
  variant?: string;
  fallback?: boolean;
  active?: boolean;
};

export default function AdCreative({
  ad,
  className = "",
  idSuffix,
  wrapClassName,
  variant,
  fallback = false,
  active = true,
}: AdCreativeProps) {
  const sizeClass = variant ?? ad.sizeClass;
  const slot = active ? (
    <GoogleAdUnit ad={ad} sizeClass={sizeClass} className={className} idSuffix={idSuffix} />
  ) : (
    <figure className="ad-unit-frame">
      <div
        className={`google-ad-slot google-ad-slot--pending ${sizeClass}`}
        data-ad-unit={ad.dataUnit}
        data-google-ad-unit={ad.google?.adUnitCode}
        aria-label="Advertisement"
      />
    </figure>
  );

  if (!wrapClassName) return slot;

  const wide = !sizeClass.includes("medium-rect") && Boolean(ad.google?.sizes.some(([width]) => width > 300));

  return (
    <div className={[wrapClassName, fallback ? "ad-has-fallback" : ""].filter(Boolean).join(" ")} aria-label="Advertisement">
      {slot}
      {fallback ? <HouseAd seed={idSuffix ?? ad.placement} wide={wide} /> : null}
    </div>
  );
}
