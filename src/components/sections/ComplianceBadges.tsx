import { compliance } from "@/content/site";

/**
 * Named authorities with reference numbers, not generic "verified" seals —
 * an unverifiable badge costs more trust than it earns with this audience.
 */
export function ComplianceBadges() {
  return (
    <section className="border-b border-manifest-100 bg-manifest-900 py-20 text-sterile lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-prose">
          <h2 className="font-display text-display-md text-white">
            Licensed, filed, and inspectable
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-manifest-200">
            Every import runs through the same regulatory path. The references
            below are on file and can be checked with the issuing authority.
          </p>
        </div>

        <dl className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {compliance.map((item) => (
            <div key={item.authority} className="border-t border-manifest-600 pt-5">
              <dt className="font-display text-xl text-white">{item.authority}</dt>
              <dd className="mt-1 text-sm text-manifest-200">{item.fullName}</dd>
              <dd className="mt-4 text-sm leading-relaxed text-manifest-100">
                {item.credential}
              </dd>
              <dd className="mt-3 font-code text-[11px] text-phial-200">
                {item.reference}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
