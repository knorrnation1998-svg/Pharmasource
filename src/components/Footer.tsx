import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-manifest-900 text-manifest-300 border-t border-manifest-800 pt-16 pb-12 mt-20">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        <div className="space-y-4">
          <h3 className="text-white font-display font-bold text-lg">Keyani&apos;s Supply Solutions</h3>
          <p className="text-xs text-manifest-400 leading-relaxed">
            Direct institutional procurement hub for certified hospital injectables, biologics, and emergency pharmaceuticals across Cameroon and Central Africa.
          </p>
          <div className="text-xs text-manifest-400">
            <p className="font-semibold text-white">WhatsApp / Direct Dispatch:</p>
            <p className="mt-1">+237 6 77 07 43 85</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Headquarters & Hubs</h4>
          <ul className="space-y-2 text-xs text-manifest-400">
            <li><strong className="text-white">Douala Hub:</strong> Akwa Medical Industrial Zone</li>
            <li><strong className="text-white">Yaoundé Depot:</strong> Bastos Clinical Supply Corridor</li>
            <li><strong className="text-white">Operation Hours:</strong> Mon – Sat: 07:30 – 19:00 WAT</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Institutional Links</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/catalog" className="hover:text-white transition-colors">Hospital Catalog (174 Formulations)</Link></li>
            <li><Link href="/cart" className="hover:text-white transition-colors">Institutional Order Cart</Link></li>
            <li><Link href="/checkout" className="hover:text-white transition-colors">Secure Paystack Checkout</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-white font-semibold text-sm uppercase tracking-wider">Compliance & Staff</h4>
          <p className="text-xs text-manifest-400 leading-relaxed">
            Regulated under Cameroon pharmaceutical distribution standards. Authorized healthcare procurement only.
          </p>
          <div className="pt-2">
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 bg-manifest-800 text-manifest-200 rounded-lg hover:bg-manifest-700 hover:text-white transition-all border border-manifest-700"
            >
              <span>🔒 Staff Portal (Admin Login)</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-8 border-t border-manifest-800 flex flex-col sm:flex-row justify-between items-center text-xs text-manifest-500">
        <p>&copy; 2026 Keyani&apos;s Supply Solutions. All rights reserved.</p>
        <p className="mt-2 sm:mt-0">Knorkoroh Agbama &bull; Institutional Supply Chain Management</p>
      </div>
    </footer>
  );
}