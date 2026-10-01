"use client";

import { useCart } from "@/context/CartContext";
import { formatXaf } from "@/lib/utils";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart } = useCart();

  // Safely compute subtotal with fallback checks
  const subtotal = Array.isArray(items) 
    ? items.reduce((acc, item) => {
        const price = item?.product?.priceXaf || item?.priceXaf || 0;
        const qty = item?.quantity || 1;
        return acc + (price * qty);
      }, 0)
    : 0;

  return (
    <div className="min-h-screen bg-sterile py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Keyani Supply Solutions</span>
            <h1 className="text-3xl font-bold text-manifest-900 mt-1">Institutional Order Basket</h1>
            <p className="text-sm text-manifest-600 mt-1">Review your selected formulations, adjust quantities, and proceed to checkout.</p>
          </div>
          {items && items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:text-red-800 font-semibold px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg transition-all"
            >
              Clear Basket
            </button>
          )}
        </div>

        {!items || items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-manifest-100 p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-manifest-50 text-manifest-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              🛒
            </div>
            <h2 className="text-xl font-bold text-manifest-900">Your Basket is Empty</h2>
            <p className="text-sm text-manifest-600 max-w-md mx-auto">
              You haven&apos;t added any hospital injectables or formulations to your procurement list yet.
            </p>
            <div className="pt-4">
              <Link
                href="/catalog"
                className="inline-block bg-manifest-900 hover:bg-manifest-800 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all text-sm"
              >
                Browse Current Catalogue
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => {
                const product = item?.product || item;
                const productId = product?.id || index;
                const productName = product?.name || "Hospital Formulation";
                const productInn = product?.inn || "";
                const productUnit = product?.unit || "";
                const productCategory = product?.category || "Injectable";
                const unitPrice = product?.priceXaf || 0;
                const qty = item?.quantity || 1;

                return (
                  <div key={productId} className="bg-white p-5 rounded-2xl shadow-sm border border-manifest-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-semibold rounded-full border border-emerald-200">
                        {productCategory}
                      </span>
                      <h3 className="font-bold text-manifest-900 text-base">{productName}</h3>
                      <p className="text-xs text-manifest-500">{productInn} {productUnit ? `\u2022 ${productUnit}` : ""}</p>
                      <p className="text-xs font-semibold text-manifest-700 mt-1">Unit Price: {formatXaf(unitPrice)}</p>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-manifest-200 rounded-xl overflow-hidden bg-manifest-50">
                        <button
                          onClick={() => updateQuantity(productId, Math.max(1, qty - 1))}
                          className="px-3 py-1.5 text-manifest-700 hover:bg-manifest-200 transition-colors font-bold text-sm"
                        >
                          -
                        </button>
                        <span className="px-4 py-1.5 text-sm font-semibold text-manifest-900 bg-white">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(productId, qty + 1)}
                          className="px-3 py-1.5 text-manifest-700 hover:bg-manifest-200 transition-colors font-bold text-sm"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <span className="block font-bold text-manifest-900 text-sm">
                          {formatXaf(unitPrice * qty)}
                        </span>
                      </div>

                      <button
                        onClick={() => removeItem(productId)}
                        className="text-manifest-400 hover:text-red-600 transition-colors p-1"
                        title="Remove item"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary & Checkout Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-manifest-100 h-fit space-y-6">
              <h2 className="text-lg font-bold text-manifest-900 border-b border-manifest-100 pb-3">Procurement Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-manifest-600">
                  <span>Total Formulations</span>
                  <span className="font-semibold text-manifest-900">
                    {items.reduce((acc, i) => acc + (i?.quantity || 1), 0)} units
                  </span>
                </div>
                <div className="flex justify-between text-manifest-600">
                  <span>Subtotal Amount</span>
                  <span className="font-semibold text-manifest-900">{formatXaf(subtotal)}</span>
                </div>
                <p className="text-[11px] text-manifest-500 leading-relaxed pt-2 border-t border-manifest-100">
                  Dispatch options and secure Paystack payment will be finalized on the checkout screen.
                </p>
              </div>

              <div className="pt-4 border-t border-manifest-100 space-y-3">
                <Link
                  href="/checkout"
                  className="w-full block text-center bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl shadow-lg transition-all text-sm tracking-wide"
                >
                  Proceed to Secure Checkout &rarr;
                </Link>
                <Link
                  href="/catalog"
                  className="w-full block text-center bg-manifest-100 hover:bg-manifest-200 text-manifest-800 font-semibold py-3 rounded-xl transition-all text-xs"
                >
                  Continue Browsing Catalogue
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}