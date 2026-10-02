import { NextResponse, type NextRequest } from "next/server";
import { repository } from "@/lib/repository";
import { paymentProvider } from "@/lib/payments";
import type { Order } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("tx_ref");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

  if (!reference) {
    return NextResponse.redirect(`${siteUrl}/checkout/failed`);
  }

  const verified = await paymentProvider().verify(reference);
  const orders: Order[] = await repository.listOrders();
  const order = orders.find((o: Order) => o.reference === reference);

  const settled =
    verified.successful && order && verified.amountXaf >= order.totalXaf;

  return NextResponse.redirect(
    settled
      ? `${siteUrl}/checkout/confirmed?ref=${encodeURIComponent(reference)}`
      : `${siteUrl}/checkout/failed?ref=${encodeURIComponent(reference)}`
  );
}