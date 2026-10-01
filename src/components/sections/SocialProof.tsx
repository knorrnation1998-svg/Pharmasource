import { impactMetrics, testimonials } from "@/content/site";

export function SocialProof() {
  return (
    <section className="border-b border-manifest-100 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <dl className="grid gap-x-8 gap-y-10 border-b border-manifest-100 pb-14 sm:grid-cols-2 lg:grid-cols-4">
          {impactMetrics.map((metric) => (
            <div key={metric.label}>
              <dt className="sr-only">{metric.label}</dt>
              <dd className="tabular font-display text-4xl text-manifest-900">
                {metric.value}
              </dd>
              <dd className="mt-2 text-sm font-medium text-manifest-800">
                {metric.label}
              </dd>
              <dd className="mt-1 text-sm text-manifest-400">{metric.note}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-14 font-display text-display-md text-manifest-900">
          What clinicians say
        </h2>

        <div className="mt-10 grid gap-10 lg:grid-cols-3">
          {testimonials.map((item) => (
            <figure key={item.name}>
              <blockquote className="font-display text-lg leading-relaxed text-manifest-800">
                {item.quote}
              </blockquote>
              <figcaption className="mt-5 border-t border-manifest-100 pt-4 text-sm">
                <span className="font-medium text-manifest-800">{item.name}</span>
                <span className="mt-0.5 block text-manifest-400">
                  {item.role}, {item.facility}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
