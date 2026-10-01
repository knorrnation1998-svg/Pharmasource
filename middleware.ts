import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth-edge";

/**
 * Edge middleware gate. Verifies the signed session JWT before any admin
 * route renders. Role checks are re-asserted inside every Server Action —
 * middleware is a first line of defence, never the only one.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const token = request.cookies.get("ps_session")?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session || session.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
