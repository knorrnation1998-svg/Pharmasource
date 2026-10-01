"use client";

import Link from "next/link";
import { useCatalogFilters } from "@/hooks/useCatalogFilters";
import { StatusPill } from "@/components/ui/StatusPill";
import { ColdChainMark } from "@/components/ui/ColdChainMark";
import { CATEGORY_LABEL, ORIGIN_LABEL, formatXaf } from "@/lib/utils";
import { stockStatus, type Product, type ProductCategory, type Origin } from "@/lib/types";

const CATEGORIES: ProductCategory[] = [
  "rare-drug",
  "specialised-injection",
  "diagnostic-reagent",
  "cold-chain-biologic",
];

const ORIGINS: Origin[] = ["US", "FR", "DE", "CH", "BE", "UK", "NL"];

/**
 * Presented as a manifest ledger rather than a card grid: clinicians compare
 * across rows (origin, temperature band, lead time), and a grid hides exactly
 * the comparison they need to make.
 */
export function CatalogPreview({ products }: { products: Product[] }) {
  const { filters, results, update, reset, isFiltered } = useCatalogFilters(products);

  return (
    <section className="border-b border-manifest-100 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-prose">
            <h2 className="font-display text-display-md text-manifest-900">
              Current catalogue
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-manifest-600">
              Items held in Douala ship within 48 hours. Anything marked sourced
              to order follows the full import path — the lead time shown is the
              realistic one, not the best case.
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-sm font-medium text-manifest-800 underline decoration-phial-500 decoration-2 underline-offset-4"
          >
            See all {products.length} items
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="catalog-search">
            Search by drug name or manufacturer
          </label>
          <input
            id="catalog-search"
            type="search"
            value={filters.query}
            onChange={(e) => update("query", e.target.value)}
            placeholder="Search by INN, brand or manufacturer"
            className="field max-w-xs"
          />

          <select
            aria-label="Filter by category"
            value={filters.category}
            onChange={(e) => update("category", e.target.value as ProductCategory | "all")}
            className="field w-auto"
          >
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by country of origin"
            value={filters.origin}
            onChange={(e) => update("origin", e.target.value as Origin | "all")}
            className="field w-auto"
          >
            <option value="all">All origins</option>
            {ORIGINS.map((o) => (
              <option key={o} value={o}>
                {ORIGIN_LABEL[o]}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-manifest-600">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => update("inStockOnly", e.target.checked)}
              className="h-4 w-4 rounded-sheet border-manifest-200 text-phial-500 focus:ring-phial-500"
            />
            Held in Douala only
          </label>

          {isFiltered && (
            <button
              onClick={reset}
              className="text-sm text-manifest-400 underline underline-offset-4 hover:text-manifest-800"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Ledger */}
        <div className="sheet mt-8 shadow-sheet">
          <div className="hidden grid-cols-manifest gap-4 border-b border-manifest-100 px-5 py-3 text-xs font-medium text-manifest-400 lg:grid">
            <span>Product</span>
            <span>Origin</span>
            <span>Cold chain</span>
            <span>Lead time</span>
            <span className="text-right">Price</span>
          </div>

          {results.length === 0 ? (
            <p className="px-5 py-16 text-center text-sm text-manifest-400">
              Nothing matches those filters. Clear them, or send us the INN and
              we will quote a sourcing route.
            </p>
          ) : (
            <ul>
              {results.map((product) => (
                <li
                  key={product.id}
                  className="sheet-row grid gap-x-4 gap-y-3 px-5 py-5 lg:grid-cols-manifest lg:items-center"
                >
                  <div>
                    <p className="font-medium text-manifest-800">
                      {product.inn}
                      {product.brandName && (
                        <span className="font-normal text-manifest-400">
                          {" "}
                          &middot; {product.brandName}
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-manifest-400">
                      {product.presentation} &middot; {product.manufacturer}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <StatusPill status={stockStatus(product)} />
                      {product.requiresPrescription && (
                        <span className="text-xs text-manifest-400">
                          Prescription required
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-sm text-manifest-600">
                    {ORIGIN_LABEL[product.origin]}
                  </span>

                  <ColdChainMark band={product.coldChain} />

                  <span className="tabular text-sm text-manifest-600">
                    {product.leadTimeDays} days
                  </span>

                  <span className="tabular text-sm font-medium text-manifest-900 lg:text-right">
                    {formatXaf(product.priceXaf)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
