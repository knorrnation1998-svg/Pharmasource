import Link from "next/link";
import { site } from "@/content/site";

/**
 * The hero opens on a live shipment manifest rather than a stat-and-gradient
 * block: for this audience, evidence that goods actually move is the pitch.
 */
const inTransit = [
  { inn: "Eculizumab", origin: "Paris CDG", band: "2\u20138 \u00B0C", eta: "4 days", lot: "EC-24F117" },
  { inn: "Caplacizumab", origin: "Brussels BRU", band: "2\u20138 \u00B0C", eta: "6 days", lot: "CP-24B802" },
  { inn: "HbA1c reagent kit", origin: "Frankfurt FRA", band: "2\u20138 \u00B0C", eta: "3 days", lot: "RG-24D410" },
];

export function Hero() {
  return (
    <section className="border-b border-manifest-100 bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-28">
        <div>
          <h1 className="font-display text-display-lg text-manifest-900">
            The medicine exists.
            <br />
            Getting it here is the work.
          </h1>

          <p className="mt-6 max-w-prose text-lg leading-relaxed text-manifest-600">
            We import rare drugs, specialised injections and diagnostic reagents
            from licensed suppliers in France, Germany, Belgium and the United
            States into {site.city} — with the import authorisation filed, the
            cold chain validated, and the customs file complete before anything
            reaches your facility.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center rounded-sheet bg-manifest-800 px-6 py-3 text-sm font-medium text-sterile transition-colors hover:bg-manifest-900"
            >
              Browse the catalogue
            </Link>
            <Link
              href="#sourcing"
              className="inline-flex items-center rounded-sheet border border-manifest-200 px-6 py-3 text-sm font-medium text-manifest-800 transition-colors hover:border-manifest-400"
            >
              How sourcing works
            </Link>
          </div>

          <p className="mt-6 text-sm text-manifest-400">
            Prescription required for scheduled products. Quotes include duties
            and clearance — no charges appear later.
          </p>
        </div>

        {/* Manifest panel — the brand motif, stated once and reused. */}
        <div className="sheet self-start shadow-sheet">
          <div className="flex items-baseline justify-between border-b border-manifest-100 px-5 py-4">
            <h2 className="font-display text-base text-manifest-800">
              In transit this week
            </h2>
            <span className="font-code text-[11px] text-manifest-400">
              MAN/2024/W38
            </span>
          </div>

          <ul>
            {inTransit.map((item) => (
              <li
                key={item.lot}
                className="sheet-row grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 px-5 py-4"
              >
                <div>
                  <p className="font-medium text-manifest-800">{item.inn}</p>
                  <p className="mt-0.5 text-sm text-manifest-400">
                    {item.origin}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular text-sm font-medium text-manifest-800">
                    {item.eta}
                  </p>
                  <p className="tabular mt-0.5 text-xs text-clearance-700">
                    {item.band}
                  </p>
                </div>
                <p className="col-span-2 font-code text-[11px] text-manifest-400">
                  LOT {item.lot}
                </p>
              </li>
            ))}
          </ul>

          <p className="border-t border-manifest-100 px-5 py-3 text-xs text-manifest-400">
            Temperature logs are read on arrival and filed with each order.
          </p>
        </div>
      </div>
    </section>
  );
}
