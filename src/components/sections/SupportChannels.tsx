import { site } from "@/content/site";

const channels = [
  {
    label: "WhatsApp",
    detail: "Fastest route for an urgent prescription",
    href: `https://wa.me/${site.whatsapp}`,
    value: site.phone,
  },
  {
    label: "Sourcing desk",
    detail: "Send a prescription or a product reference",
    href: `mailto:${site.email}`,
    value: site.email,
  },
  {
    label: "Telephone",
    detail: "Monday to Saturday, 07:30\u201319:00 WAT",
    href: `tel:${site.phone.replace(/\s/g, "")}`,
    value: site.phone,
  },
];

export function SupportChannels() {
  return (
    <section id="contact" className="bg-manifest-900 py-20 text-sterile lg:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-prose">
          <h2 className="font-display text-display-md text-white">
            Send us the prescription
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-manifest-200">
            If you know the INN and the presentation, we can usually come back
            with a price, a lead time and a regulatory route the same day.
          </p>
        </div>

        <ul className="mt-12 grid gap-px overflow-hidden rounded-sheet bg-manifest-600 sm:grid-cols-3">
          {channels.map((channel) => (
            <li key={channel.label} className="bg-manifest-900 p-7">
              <h3 className="font-display text-xl text-white">{channel.label}</h3>
              <p className="mt-2 text-sm text-manifest-200">{channel.detail}</p>
              <a
                href={channel.href}
                className="mt-5 inline-block text-sm font-medium text-phial-200 underline underline-offset-4"
              >
                {channel.value}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
