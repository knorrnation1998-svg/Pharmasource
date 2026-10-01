import { NextResponse, type NextRequest } from "next/server";
import { repository } from "@/lib/repository";
import { paymentProvider } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Browser redirect target. Purely for what the buyer sees — the webhook is
 * what actually settles the order. We verify here too so the confirmation page
 * is accurate even if the webhook is still in flight.
 */
export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("tx_ref");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  if (!reference) {
    return NextResponse.redirect(`${siteUrl}/checkout/failed`);
  }

  const verified = await paymentProvider().verify(reference);
  const orders = await repository.listOrders();
  const order = orders.find((o) => o.reference === reference);

  const settled =
    verified.successful && order && verified.amountXaf >= order.totalXaf;

  return NextResponse.redirect(
    settled
      ? `${siteUrl}/checkout/confirmed?ref=${encodeURIComponent(reference)}`
      : `${siteUrl}/checkout/failed?ref=${encodeURIComponent(reference)}`
  );
}
