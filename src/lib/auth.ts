import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { scryptSync, timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth-edge";
import type { Session } from "@/lib/types";

const SCRYPT_SALT = "pharmasource";

/** Constant-time credential check against the env-stored scrypt hash. */
export function verifyCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const expectedHash = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedEmail || !expectedHash) return false;
  if (email.toLowerCase().trim() !== expectedEmail.toLowerCase().trim()) {
    return false;
  }
  const candidate = scryptSync(password, SCRYPT_SALT, 64);
  const expected = Buffer.from(expectedHash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}

/**
 * Call at the top of every privileged Server Action. Middleware protects the
 * route; this protects the action, which is independently addressable.
 */
export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");
  return session;
}
