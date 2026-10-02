import Image from "next/image";
import Link from "next/link";
import { repository } from "@/lib/repository";
import { formatXaf } from "@/lib/utils";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await repository.listProducts();
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-sterile">
      {/* Hero Section: Keyani's Supply Solutions */}
      <section className="relative bg-manifest-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/images/hero-banner-1.png"
            alt="Keyani's Supply Solutions"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block px-3 py-1 bg-manifest-800 text-manifest-200 text-xs font-semibold uppercase tracking-wider rounded-full border border-manifest-700">
              Keyani&apos;s Supply Solutions &mdash; Cameroon Hub
            </span>
            <h1 className="font-display text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Direct Clinical & Hospital Supply Chain
            </h1>
            <p className="text-manifest-200 text-base max-w-xl">
              Procure certified hospital injectables, biologics, and emergency pharmaceuticals with instant institutional dispatch. 174+ global formulations verified in stock.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link
                href="/catalog"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg transition-all text-sm tracking-wide"
              >
                Browse Master Catalog
              </Link>
              <Link
                href="/cart"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 transition-all text-sm tracking-wide"
              >
                Book Your Order Now
              </Link>
            </div>
          </div>

          {/* Book Your Order Preview Graphic */}
          <div className="relative flex justify-center">
            <div className="relative w-full max-w-lg aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <Image
                src="/images/hero-banner-0.png"
                alt="Book Your Order Platform Preview"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Formulations Grid */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-manifest-500">Verified Stock</span>
            <h2 className="text-2xl font-bold text-manifest-900 mt-1">Featured Hospital Injectables</h2>
          </div>
          <Link href="/catalog" className="text-sm font-semibold text-manifest-700 hover:text-manifest-900">
            View All 174 Items &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product: Product) => (
            <div key={product.id} className="bg-white p-5 rounded-xl border border-manifest-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-full border border-emerald-200 mb-3">
                  In Stock
                </span>
                <h3 className="font-semibold text-manifest-900">{(product as any).name || product.brandName || product.inn}</h3>
                <p className="text-xs text-manifest-500 mt-1">{product.inn} &mdash; {product.presentation || (product as any).unit || "Vial"}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-manifest-100 flex items-center justify-between">
                <span className="font-bold text-manifest-900">{formatXaf(product.priceXaf)}</span>
                <Link href="/cart" className="text-xs font-semibold bg-manifest-900 text-white px-3 py-2 rounded-lg">
                  Procure
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}