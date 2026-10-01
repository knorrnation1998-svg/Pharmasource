'use client';

import React, { useState } from 'react';
import Link from "next/link";
import { site } from "@/content/site";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "./CartDrawer";

export function Header() {
  const { totalItems } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Placeholder for checkout redirection/handler
  const handleCheckout = () => {
    setIsCartOpen(false);
    // Redirect to checkout page or open checkout modal
    window.location.href = '/checkout';
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-manifest-100 bg-sterile/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-lg text-manifest-900">
            {site.name}
          </Link>

          <nav className="flex items-center gap-7 text-sm">
            <Link href="/catalog" className="text-manifest-600 hover:text-manifest-900">
              Catalogue
            </Link>
            <Link href="/#sourcing" className="text-manifest-600 hover:text-manifest-900">
              Sourcing
            </Link>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 text-manifest-600 hover:text-manifest-900 font-medium"
            >
              <span>Basket</span>
              {totalItems > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-manifest-800 text-[11px] font-bold text-sterile">
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              href="/#contact"
              className="rounded-sheet bg-manifest-800 px-4 py-2 font-medium text-sterile hover:bg-manifest-900"
            >
              Request a quote
            </Link>
          </nav>
        </div>
      </header>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckout}
      />
    </>
  );
}