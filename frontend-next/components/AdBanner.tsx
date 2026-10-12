import type { AdPlacement } from "@/lib/wordpress";
import AdSlot from "./AdSlot";

type AdBannerProps = {
  placement: AdPlacement;
  className?: string;
  idSuffix?: string;
  wrapClassName?: string;
  variant?: string;
  fallback?: boolean;
};

export default function AdBanner({ placement, className, idSuffix, wrapClassName, variant, fallback }: AdBannerProps) {
  return (
    <AdSlot
      placement={placement}
      className={className}
      idSuffix={idSuffix}
      wrapClassName={wrapClassName}
      variant={variant}
      fallback={fallback}
    />
  );
}
