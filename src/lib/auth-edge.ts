import { jwtVerify, SignJWT } from "jose";
import type { Session } from "@/lib/types";

/**
 * Edge-runtime safe. `jose` uses WebCrypto, so this module works inside
 * middleware where the Node crypto module is unavailable.
 */

const secret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(value);
};

export const SESSION_COOKIE = "ps_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

export async function signSessionToken(session: Session): Promise<string> {
  return new SignJWT({ email: session.email, role: session.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.sub)
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secret());
}

export async function verifySessionToken(
  token: string
): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.email !== "string") return null;
    const role = payload.role === "admin" ? "admin" : "viewer";
    return { sub: payload.sub, email: payload.email, role };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};
