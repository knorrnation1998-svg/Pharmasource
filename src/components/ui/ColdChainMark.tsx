import { COLD_CHAIN_LABEL, cn } from "@/lib/utils";
import type { ColdChain } from "@/lib/types";

/**
 * Temperature band is the single most safety-relevant attribute of a shipment,
 * so it gets its own mark rather than being buried in a spec list.
 */
export function ColdChainMark({
  band,
  className,
}: {
  band: ColdChain;
  className?: string;
}) {
  const frozen = band === "-20C" || band === "-70C";
  const chilled = band === "2-8C";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium tabular",
        frozen && "text-manifest-600",
        chilled && "text-clearance-700",
        !frozen && !chilled && "text-manifest-400",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          frozen ? "bg-manifest-400" : chilled ? "bg-clearance-500" : "bg-manifest-200"
        )}
      />
      {COLD_CHAIN_LABEL[band]}
    </span>
  );
}
