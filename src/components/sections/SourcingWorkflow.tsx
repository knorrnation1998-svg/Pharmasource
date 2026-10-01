import { sourcingSteps } from "@/content/site";

/**
 * Numbered markers are used here because the content genuinely is an ordered
 * sequence — each step gates the next.
 */
export function SourcingWorkflow() {
  return (
    <section id="sourcing" className="border-b border-manifest-100 py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-prose">
          <h2 className="font-display text-display-md text-manifest-900">
            From a prescription in Yaound&eacute; to a vial in your hand
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-manifest-600">
            Six stages, each with a document attached. You can ask us where an
            order sits at any point and get an answer with a reference number,
            not an estimate.
          </p>
        </div>

        <ol className="mt-14 grid gap-px overflow-hidden rounded-sheet border border-manifest-100 bg-manifest-100 sm:grid-cols-2 lg:grid-cols-3">
          {sourcingSteps.map((step) => (
            <li key={step.step} className="bg-white p-7">
              <div className="flex items-baseline justify-between">
                <span className="font-code text-sm font-semibold text-phial-500">
                  {String(step.step).padStart(2, "0")}
                </span>
                <span className="tabular text-xs text-manifest-400">
                  {step.duration}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg leading-snug text-manifest-900">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-manifest-600">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
