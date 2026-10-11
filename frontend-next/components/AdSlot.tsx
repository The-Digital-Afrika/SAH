import { getAdByPlacement, type AdPlacement } from "@/lib/wordpress";
import AdCreative from "./AdCreative";

type AdSlotProps = {
  placement: AdPlacement;
  className?: string;
  idSuffix?: string;
  wrapClassName?: string;
  variant?: string;
  fallback?: boolean;
};

export default async function AdSlot({ placement, className = "", idSuffix, wrapClassName, variant, fallback = false }: AdSlotProps) {
  const ad = await getAdByPlacement(placement);
  return (
    <AdCreative
      ad={ad}
      className={className}
      idSuffix={idSuffix}
      wrapClassName={wrapClassName}
      variant={variant}
      fallback={fallback}
    />
  );
}
