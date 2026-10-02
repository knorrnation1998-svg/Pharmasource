"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createProductAction } from "@/server/actions/inventory";
import { Button } from "@/components/ui/Button";
import { CATEGORY_LABEL, ORIGIN_LABEL } from "@/lib/utils";
import type { ActionResult, Product } from "@/lib/types";

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="mt-1 text-xs text-excursion-500">{messages[0]}</p>;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding\u2026" : "Add to catalogue"}
    </Button>
  );
}

export function ProductForm() {
  const [state, formAction] = useActionState<ActionResult<Product> | null, FormData>(
    createProductAction,
    null
  );
  const errors = state && !state.ok ? (state as any).fieldErrors : undefined;

  return (
    <form action={formAction} className="sheet p-7 shadow-sheet">
      <h2 className="font-display text-heading text-manifest-900">
        Add a product
      </h2>
      <p className="mt-2 text-sm text-manifest-600">
        The HS code and MINSANTE reference appear on the customs file, so enter
        them exactly as they are issued.
      </p>

      {state && !state.ok && (
        <p
          role="alert"
          className="mt-5 rounded-sheet border border-excursion-500/30 bg-excursion-100 px-4 py-3 text-sm text-excursion-500"
        >
          {state.error}
        </p>
      )}

      {state?.ok && (
        <p
          role="status"
          className="mt-5 rounded-sheet border border-clearance-500/30 bg-clearance-100 px-4 py-3 text-sm text-clearance-700"
        >
          {state.data.inn} added to the catalogue.
        </p>
      )}

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="inn">International non-proprietary name</label>
          <input id="inn" name="inn" required className="field" placeholder="Eculizumab" />
          <FieldError messages={errors?.inn} />
        </div>

        <div>
          <label className="label" htmlFor="brandName">Brand name</label>
          <input id="brandName" name="brandName" className="field" placeholder="Soliris" />
        </div>

        <div>
          <label className="label" htmlFor="presentation">Presentation</label>
          <input
            id="presentation"
            name="presentation"
            required
            className="field"
            placeholder="300 mg / 30 mL vial"
          />
          <FieldError messages={errors?.presentation} />
        </div>

        <div>
          <label className="label" htmlFor="manufacturer">Manufacturer</label>
          <input id="manufacturer" name="manufacturer" required className="field" />
          <FieldError messages={errors?.manufacturer} />
        </div>

        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" name="category" className="field" defaultValue="rare-drug">
            {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="origin">Country of origin</label>
          <select id="origin" name="origin" className="field" defaultValue="FR">
            {Object.entries(ORIGIN_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="hsCode">HS tariff code</label>
          <input
            id="hsCode"
            name="hsCode"
            required
            className="field font-code"
            placeholder="3002.12.00"
          />
          <FieldError messages={errors?.hsCode} />
        </div>

        <div>
          <label className="label" htmlFor="coldChain">Cold chain band</label>
          <select id="coldChain" name="coldChain" className="field" defaultValue="2-8C">
            <option value="ambient">Ambient</option>
            <option value="2-8C">2&ndash;8 &deg;C</option>
            <option value="-20C">&minus;20 &deg;C</option>
            <option value="-70C">&minus;70 &deg;C</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="priceXaf">Price (XAF)</label>
          <input
            id="priceXaf"
            name="priceXaf"
            type="number"
            min={1}
            required
            className="field tabular"
          />
          <FieldError messages={errors?.priceXaf} />
        </div>

        <div>
          <label className="label" htmlFor="leadTimeDays">Lead time (days)</label>
          <input
            id="leadTimeDays"
            name="leadTimeDays"
            type="number"
            min={1}
            max={180}
            defaultValue={18}
            className="field tabular"
          />
        </div>

        <div>
          <label className="label" htmlFor="stockQty">Opening stock</label>
          <input
            id="stockQty"
            name="stockQty"
            type="number"
            min={0}
            defaultValue={0}
            className="field tabular"
          />
        </div>

        <div>
          <label className="label" htmlFor="reorderLevel">Reorder level</label>
          <input
            id="reorderLevel"
            name="reorderLevel"
            type="number"
            min={0}
            defaultValue={5}
            className="field tabular"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="minsanteRef">
            MINSANTE authorisation reference
          </label>
          <input
            id="minsanteRef"
            name="minsanteRef"
            className="field font-code"
            placeholder="AI/2024/DPML/0000 — leave blank while pending"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="imageUrl">Product image URL</label>
          <input id="imageUrl" name="imageUrl" type="url" className="field" />
          <p className="mt-1 text-xs text-manifest-400">
            Point at an uploaded asset. Wire this to Vercel Blob or UploadThing
            for direct file upload — both have free tiers.
          </p>
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="description">Indication</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            required
            className="field"
            placeholder="What this treats, and any handling note a pharmacist should know."
          />
          <FieldError messages={errors?.description} />
        </div>

        <label className="flex items-center gap-2 text-sm text-manifest-600 sm:col-span-2">
          <input
            type="checkbox"
            name="requiresPrescription"
            defaultChecked
            className="h-4 w-4 rounded-sheet border-manifest-200 text-phial-500 focus:ring-phial-500"
          />
          Prescription required
        </label>
      </div>

      <div className="mt-7 border-t border-manifest-100 pt-6">
        <SubmitButton />
      </div>
    </form>
  );
}
