"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { Origin, Product, ProductCategory } from "@/lib/types";
import { stockStatus } from "@/lib/types";

export interface CatalogFilters {
  query: string;
  category: ProductCategory | "all";
  origin: Origin | "all";
  inStockOnly: boolean;
}

const INITIAL: CatalogFilters = {
  query: "",
  category: "all",
  origin: "all",
  inStockOnly: false,
};

/**
 * Filtering is client-side because the catalogue is small and instant feedback
 * matters more than payload size here. Past ~500 SKUs, move this to a server
 * component with searchParams and drop the hook.
 */
export function useCatalogFilters(products: Product[]) {
  const [filters, setFilters] = useState<CatalogFilters>(INITIAL);
  // Keeps typing responsive while the list re-filters.
  const deferredQuery = useDeferredValue(filters.query);

  const results = useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();

    return products.filter((product) => {
      if (filters.category !== "all" && product.category !== filters.category) {
        return false;
      }
      if (filters.origin !== "all" && product.origin !== filters.origin) {
        return false;
      }
      if (filters.inStockOnly && stockStatus(product) === "on-order") {
        return false;
      }
      if (!needle) return true;

      return [
        product.inn,
        product.brandName ?? "",
        product.manufacturer,
        product.presentation,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [products, deferredQuery, filters.category, filters.origin, filters.inStockOnly]);

  const update = <K extends keyof CatalogFilters>(
    key: K,
    value: CatalogFilters[K]
  ) => setFilters((prev) => ({ ...prev, [key]: value }));

  const reset = () => setFilters(INITIAL);
  const isFiltered =
    filters.query !== "" ||
    filters.category !== "all" ||
    filters.origin !== "all" ||
    filters.inStockOnly;

  return { filters, results, update, reset, isFiltered };
}
