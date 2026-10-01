import { cn } from "@/lib/utils";
import type { StockStatus } from "@/lib/types";

const COPY: Record<StockStatus, { label: string; className: string }> = {
  "in-stock": {
    label: "In stock, Douala",
    className: "bg-clearance-100 text-clearance-700",
  },
  "low-stock": {
    label: "Low stock",
    className: "bg-phial-50 text-phial-700",
  },
  "on-order": {
    label: "Sourced to order",
    className: "bg-manifest-50 text-manifest-600",
  },
  unavailable: {
    label: "Unavailable",
    className: "bg-excursion-100 text-excursion-500",
  },
};

export function StatusPill({ status }: { status: StockStatus }) {
  const { label, className } = COPY[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}
