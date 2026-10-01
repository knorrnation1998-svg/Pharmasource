import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/** XAF has no minor unit — never divide by 100. */
export const formatXaf = (amount: number) =>
  new Intl.NumberFormat("fr-CM", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(amount);

export const ORIGIN_LABEL: Record<string, string> = {
  US: "United States",
  FR: "France",
  DE: "Germany",
  CH: "Switzerland",
  BE: "Belgium",
  UK: "United Kingdom",
  NL: "Netherlands",
};

export const COLD_CHAIN_LABEL: Record<string, string> = {
  ambient: "Ambient",
  "2-8C": "2\u20138 \u00B0C",
  "-20C": "\u221220 \u00B0C",
  "-70C": "\u221270 \u00B0C",
};

export const CATEGORY_LABEL: Record<string, string> = {
  "rare-drug": "Rare drug",
  "specialised-injection": "Specialised injection",
  "diagnostic-reagent": "Diagnostic reagent",
  "cold-chain-biologic": "Cold-chain biologic",
};

export const newId = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
