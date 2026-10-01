"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  adjustStockAction,
  deleteProductAction,
  setPriceAction,
} from "@/server/actions/inventory";
import type { Product } from "@/lib/types";

type Patch =
  | { kind: "stock"; id: string; delta: number }
  | { kind: "price"; id: string; priceXaf: number }
  | { kind: "remove"; id: string };

/**
 * Wraps the inventory Server Actions with optimistic state so the admin table
 * responds on click rather than after the round trip. React reverts the
 * optimistic value automatically if the transition throws.
 */
export function useInventoryMutations(initial: Product[]) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [products, applyOptimistic] = useOptimistic(
    initial,
    (state: Product[], patch: Patch): Product[] => {
      switch (patch.kind) {
        case "stock":
          return state.map((p) =>
            p.id === patch.id
              ? { ...p, stockQty: Math.max(0, p.stockQty + patch.delta) }
              : p
          );
        case "price":
          return state.map((p) =>
            p.id === patch.id ? { ...p, priceXaf: patch.priceXaf } : p
          );
        case "remove":
          return state.filter((p) => p.id !== patch.id);
      }
    }
  );

  const adjustStock = (id: string, delta: number) => {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ kind: "stock", id, delta });
      const result = await adjustStockAction(id, delta);
      if (!result.ok) setError(result.error);
    });
  };

  const setPrice = (id: string, priceXaf: number) => {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ kind: "price", id, priceXaf });
      const result = await setPriceAction(id, priceXaf);
      if (!result.ok) setError(result.error);
    });
  };

  const remove = (id: string) => {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ kind: "remove", id });
      const result = await deleteProductAction(id);
      if (!result.ok) setError(result.error);
    });
  };

  return { products, adjustStock, setPrice, remove, isPending, error };
}
