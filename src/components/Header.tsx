import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-manifest-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link href="/" className="font-display font-bold text-xl text-manifest-900 flex items-center gap-2">
          <span>Keyani Supply Solutions</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-manifest-700">
          <Link href="/catalog" className="hover:text-manifest-900 transition-colors">Catalogue[cite: 11]</Link>
          <Link href="/cart" className="hover:text-manifest-900 transition-colors">Basket[cite: 11]</Link>
          <Link href="/checkout" className="hover:text-manifest-900 transition-colors">Request a quote[cite: 11]</Link>
        </nav>

        <div>
          <Link
            href="/checkout"
            className="bg-manifest-900 hover:bg-manifest-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all"
          >
            Request a quote[cite: 11]
          </Link>
        </div>
      </div>
    </header>
  );
}