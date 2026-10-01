"use client";

import { useState } from "react";
import { useInventoryMutations } from "@/hooks/useInventoryMutations";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusPill";
import { ColdChainMark } from "@/components/ui/ColdChainMark";
import { CATEGORY_LABEL, ORIGIN_LABEL, cn, formatXaf } from "@/lib/utils";
import { stockStatus, type Product } from "@/lib/types";

/**
 * The whole point of this screen: change stock and prices without touching
 * code. Every control writes through a Server Action and reflects immediately
 * via useOptimistic.
 */
export function InventoryTable({ initialProducts }: { initialProducts: Product[] }) {
  const { products, adjustStock, setPrice, remove, isPending, error } =
    useInventoryMutations(initialProducts);
  const [editingPrice, setEditingPrice] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState("");

  const lowStock = products.filter(
    (p) => p.stockQty <= p.reorderLevel && p.stockQty > 0
  ).length;
  const outOfStock = products.filter((p) => p.stockQty === 0).length;

  const commitPrice = (product: Product) => {
    const next = Number.parseInt(priceDraft, 10);
    if (Number.isFinite(next) && next > 0 && next !== product.priceXaf) {
      setPrice(product.id, next);
    }
    setEditingPrice(null);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-6 text-sm">
        <span className="text-manifest-600">
          <span className="tabular font-medium text-manifest-900">
            {products.length}
          </span>{" "}
          products listed
        </span>
        {lowStock > 0 && (
          <span className="text-phial-700">
            <span className="tabular font-medium">{lowStock}</span> at or below
            reorder level
          </span>
        )}
        {outOfStock > 0 && (
          <span className="text-excursion-500">
            <span className="tabular font-medium">{outOfStock}</span> out of stock
          </span>
        )}
        {isPending && <span className="text-manifest-400">Saving&hellip;</span>}
      </div>

      {error && (
        <p
          role="alert"
          className="mb-5 rounded-sheet border border-excursion-500/30 bg-excursion-100 px-4 py-3 text-sm text-excursion-500"
        >
          {error}
        </p>
      )}

      <div className="sheet overflow-x-auto shadow-sheet">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-manifest-100 text-left text-xs font-medium text-manifest-400">
              <th scope="col" className="px-5 py-3">Product</th>
              <th scope="col" className="px-5 py-3">Origin</th>
              <th scope="col" className="px-5 py-3">Cold chain</th>
              <th scope="col" className="px-5 py-3 text-right">Price (XAF)</th>
              <th scope="col" className="px-5 py-3 text-center">Stock</th>
              <th scope="col" className="px-5 py-3">Status</th>
              <th scope="col" className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-manifest-400">
                  No products yet. Add the first one to open the catalogue.
                </td>
              </tr>
            )}

            {products.map((product) => {
              const belowReorder =
                product.stockQty <= product.reorderLevel && product.stockQty > 0;

              return (
                <tr key={product.id} className="border-t border-manifest-100">
                  <td className="px-5 py-4">
                    <p className="font-medium text-manifest-800">{product.inn}</p>
                    <p className="mt-0.5 text-xs text-manifest-400">
                      {product.presentation} &middot; {CATEGORY_LABEL[product.category]}
                    </p>
                    <p className="mt-1 font-code text-[11px] text-manifest-400">
                      HS {product.hsCode}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-manifest-600">
                    {ORIGIN_LABEL[product.origin]}
                  </td>

                  <td className="px-5 py-4">
                    <ColdChainMark band={product.coldChain} />
                  </td>

                  <td className="px-5 py-4 text-right">
                    {editingPrice === product.id ? (
                      <input
                        autoFocus
                        type="number"
                        min={1}
                        value={priceDraft}
                        onChange={(e) => setPriceDraft(e.target.value)}
                        onBlur={() => commitPrice(product)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") commitPrice(product);
                          if (e.key === "Escape") setEditingPrice(null);
                        }}
                        className="field tabular w-32 text-right"
                        aria-label={`Price for ${product.inn} in XAF`}
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setEditingPrice(product.id);
                          setPriceDraft(String(product.priceXaf));
                        }}
                        className="tabular rounded-sheet px-2 py-1 font-medium text-manifest-900 hover:bg-manifest-50"
                      >
                        {formatXaf(product.priceXaf)}
                      </button>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustStock(product.id, -1)}
                        disabled={product.stockQty === 0}
                        aria-label={`Decrease stock of ${product.inn}`}
                      >
                        &minus;
                      </Button>
                      <span
                        className={cn(
                          "tabular w-12 text-center font-medium",
                          belowReorder ? "text-phial-700" : "text-manifest-900"
                        )}
                      >
                        {product.stockQty}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => adjustStock(product.id, 1)}
                        aria-label={`Increase stock of ${product.inn}`}
                      >
                        +
                      </Button>
                    </div>
                    <p className="mt-1 text-center text-[11px] text-manifest-400">
                      reorder at {product.reorderLevel}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <StatusPill status={stockStatus(product)} />
                  </td>

                  <td className="px-5 py-4 text-right">
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (
                          confirm(
                            `Remove ${product.inn} from the catalogue? This cannot be undone.`
                          )
                        ) {
                          remove(product.id);
                        }
                      }}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
