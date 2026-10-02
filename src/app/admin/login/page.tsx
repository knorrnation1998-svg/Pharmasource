"use client";

import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import { signInAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/Button";
import { site } from "@/content/site";
import type { ActionResult } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    signInAction,
    null
  );

  return (
    <form action={formAction} className="sheet w-full max-w-sm p-8 shadow-sheet">
      <h1 className="font-display text-heading text-manifest-900">
        {site.name}
      </h1>
      <p className="mt-2 text-sm text-manifest-600">
        Staff access to inventory and orders.
      </p>

      <input
        type="hidden"
        name="from"
        value={searchParams.get("from") ?? "/admin"}
      />

      {state && !state.ok && (
        <p
          role="alert"
          className="mt-6 rounded-sheet border border-excursion-500/30 bg-excursion-100 px-4 py-3 text-sm text-excursion-500"
        >
          { (state as any).error }
        </p>
      )}

      <div className="mt-6 space-y-5">
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            className="field"
          />
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="field"
          />
        </div>
      </div>

      <div className="mt-7">
        <SubmitButton />
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <Suspense fallback={<div className="text-sm text-manifest-500">Loading portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}