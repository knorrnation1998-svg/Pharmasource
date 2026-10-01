"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth-edge";
import { verifyCredentials } from "@/lib/auth";
import { credentialsSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

/**
 * Deliberately returns the same message for an unknown email and a wrong
 * password so the form cannot be used to enumerate accounts.
 */
export async function signInAction(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "Enter your email and password." };
  }

  const { email, password } = parsed.data;
  if (!verifyCredentials(email, password)) {
    return { ok: false, error: "Those credentials did not match." };
  }

  const token = await signSessionToken({ sub: email, email, role: "admin" });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);

  const from = formData.get("from");
  redirect(typeof from === "string" && from.startsWith("/admin") ? from : "/admin");
}

export async function signOutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
