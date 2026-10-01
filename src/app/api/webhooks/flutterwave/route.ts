import { NextResponse, type NextRequest } from "next/server";
import { repository } from "@/lib/repository";
import { paymentProvider } from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Webhooks are the authoritative payment signal — the browser redirect can be
 * abandoned, replayed or forged. The hash is checked first, then the amount is
 * re-verified against our own stored order before anything is marked paid.
 */
export async function POST(request: NextRequest) {
  const provider = paymentProvider();
  const rawBody = await request.text();
  const signature = request.headers.get("verif-hash");

  if (!provider.verifyWebhook(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: { data?: { tx_ref?: string; status?: string; amount?: number } };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const reference = payload.data?.tx_ref;
  if (!reference) {
    return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 });
  }

  // Re-verify server-side rather than trusting the webhook body's amount.
  const verified = await provider.verify(reference);
  const orders = await repository.listOrders();
  const order = orders.find((o) => o.reference === reference);

  if (!order) {
    return NextResponse.json({ error: "Unknown order" }, { status: 404 });
  }

  // Idempotent: a replayed webhook for an already-paid order is a no-op.
  if (order.status !== "awaiting-payment") {
    return NextResponse.json({ received: true });
  }

  if (!verified.successful || verified.amountXaf < order.totalXaf) {
    await repository.updateOrderStatus(reference, "cancelled");
    return NextResponse.json({ received: true });
  }

  await repository.updateOrderStatus(reference, "paid", verified.providerRef);

  // Decrement stock only once payment has actually cleared.
  for (const line of order.lines) {
    await repository.adjustStock(line.productId, -line.qty);
  }

  return NextResponse.json({ received: true });
}
