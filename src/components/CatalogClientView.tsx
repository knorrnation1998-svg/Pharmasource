"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatXaf } from "@/lib/utils";
import Link from "next/link";

interface Product {
  id: string;
  name?: string;
  brandName?: string;
  inn: string;
  category: string;
  origin: string;
  coldChain: boolean;
  leadTimeDays: number;
  priceXaf: number;
  unit?: string;
  presentation?: string;
}

export default function CatalogClientView({ initialProducts }: { initialProducts?: Product[] }) {
  const { addItem } = useCart();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const safeProducts = Array.isArray(initialProducts) ? initialProducts : [];

  const handleQtyChange = (id: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [id]: Math.max(1, qty) }));
  };

  const filteredProducts = safeProducts.filter((p) => {
    const productName = p.name || p.brandName || "";
    const matchesSearch = 
      productName.toLowerCase().includes(search.toLowerCase()) || 
      (p.inn && p.inn.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = selectedCategory === "all" || (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-sterile py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Title */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-manifest-200 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Keyani Supply Solutions</span>
            <h1 className="text-3xl font-bold text-manifest-900 mt-1">Current Catalogue</h1>
            <p className="text-sm text-manifest-600 mt-1">
              Items held in Douala ship within 48 hours. Sourced items follow full validated cold-chain import paths.
            </p>
          </div>
          <Link
            href="/cart"
            className="bg-manifest-900 hover:bg-manifest-800 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all text-sm flex items-center gap-2"
          >
            <span>🛒 View Basket & Checkout</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-manifest-100">
          <input
            type="text"
            placeholder="Search by INN, brand or manufacturer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-manifest-200 text-sm focus:outline-none focus:ring-2 focus:ring-manifest-900"
          />
          <div className="flex gap-4 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-manifest-200 text-sm bg-white text-manifest-800 focus:outline-none"
            >
              <option value="all">All categories</option>
              <option value="injectable">Injectables</option>
              <option value="antibiotic">Antibiotics</option>
              <option value="biologic">Biologics</option>
            </select>
          </div>
        </div>

        {/* Interactive Products Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-manifest-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-manifest-50/70 border-b border-manifest-200 text-xs font-semibold text-manifest-600 uppercase tracking-wider">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-4">Origin</th>
                  <th className="py-4 px-4">Cold chain</th>
                  <th className="py-4 px-4">Lead time</th>
                  <th className="py-4 px-4">Unit Price</th>
                  <th className="py-4 px-6 text-right">Select Quantity & Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-manifest-100 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-manifest-500 text-sm">
                      No matching formulations found in catalog.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const currentQty = quantities[product.id] || 1;
                    const displayName = product.name || product.brandName || product.inn;
                    const displayUnit = product.presentation || product.unit || "Vial";

                    return (
                      <tr key={product.id} className="hover:bg-manifest-50/40 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-bold text-manifest-900 text-base">{displayName}</div>
                          <div className="text-xs text-manifest-500 mt-0.5">{product.inn} &bull; {displayUnit}</div>
                          <div className="mt-2 flex gap-2">
                            <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold rounded-full border border-emerald-200">
                              In stock, Douala
                            </span>
                            <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-semibold rounded-full border border-amber-200">
                              Prescription required
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-xs font-medium text-manifest-700">{product.origin}</td>

                        <td className="py-4 px-4">
                          {product.coldChain ? (
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500" title="Cold chain required (2°C - 8°C)" />
                          ) : (
                            <span className="text-manifest-300 text-xs">&mdash;</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-xs font-semibold text-manifest-700">
                          {product.leadTimeDays} days
                        </td>

                        <td className="py-4 px-4 font-bold text-manifest-900">
                          {formatXaf(product.priceXaf)}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <div className="flex items-center border border-manifest-200 rounded-lg overflow-hidden bg-white">
                              <button
                                onClick={() => handleQtyChange(product.id, currentQty - 5 > 0 ? currentQty - 5 : 1)}
                                className="px-2 py-1.5 text-xs bg-manifest-100 text-manifest-700 hover:bg-manifest-200 font-bold"
                                title="Decrease quantity"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={currentQty}
                                onChange={(e) => handleQtyChange(product.id, parseInt(e.target.value) || 1)}
                                className="w-16 text-center py-1.5 text-xs font-bold text-manifest-900 focus:outline-none"
                              />
                              <button
                                onClick={() => handleQtyChange(product.id, currentQty + 5)}
                                className="px-2 py-1.5 text-xs bg-manifest-100 text-manifest-700 hover:bg-manifest-200 font-bold"
                                title="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => {
                                addItem({ ...product, quantity: currentQty } as any);
                                alert(`Added ${currentQty} unit(s) to your basket.`);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-lg text-xs shadow-sm transition-all whitespace-nowrap"
                            >
                              Add to Basket
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}