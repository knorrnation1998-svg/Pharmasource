import { NextResponse, type NextRequest } from "next/server";
import { repository } from "@/lib/repository";
import { paymentProvider } from "@/lib/payments";
import type { Order } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const reference = body?.data?.tx_ref || body?.tx_ref;

    if (!reference) {
      return NextResponse.json({ error: "Missing reference" }, { status: 400 });
    }

    const provider = paymentProvider();
    const verified = await provider.verify(reference);
    const orders = await repository.listOrders();
    
    // Explicitly cast orders to Order[] to satisfy strict TypeScript checking
    const order = (orders as Order[]).find((o) => o.reference === reference);

    if (!order) {
      return NextResponse.json({ error: "Unknown order" }, { status: 404 });
    }

    if (verified.successful) {
      await repository.updateOrderStatus(reference, "paid", verified.providerRef);
      
      for (const line of order.lines) {
        await repository.adjustStock(line.productId, -line.qty);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal Error" }, { status: 500 });
  }
}