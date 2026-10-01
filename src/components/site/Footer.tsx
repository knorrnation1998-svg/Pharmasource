import Link from "next/link";
import { site, compliance } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-manifest-100 bg-sterile py-14">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg text-manifest-900">{site.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-manifest-600">
            Licensed pharmaceutical importation and wholesale distribution,
            registered in {site.city}, Cameroon.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-medium text-manifest-800">Regulatory</h2>
          <ul className="mt-3 space-y-2 text-sm text-manifest-600">
            {compliance.map((c) => (
              <li key={c.authority}>
                {c.authority}{" "}
                <span className="font-code text-[11px] text-manifest-400">
                  {c.reference}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-medium text-manifest-800">Contact</h2>
          <ul className="mt-3 space-y-2 text-sm text-manifest-600">
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-manifest-900">
                {site.email}
              </a>
            </li>
            <li>
              <a href={`https://wa.me/${site.whatsapp}`} className="hover:text-manifest-900">
                WhatsApp {site.phone}
              </a>
            </li>
            <li>
              <Link href="/admin" className="hover:text-manifest-900">
                Staff sign-in
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl border-t border-manifest-100 px-6 pt-6">
        <p className="text-xs text-manifest-400">
          Prescription-only medicines are dispensed against a valid prescription
          from a practitioner registered in Cameroon. &copy;{" "}
          {new Date().getFullYear()} {site.name}.
        </p>
      </div>
    </footer>
  );
}
