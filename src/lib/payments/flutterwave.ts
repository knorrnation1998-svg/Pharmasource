import "server-only";
import type { Order } from "@/lib/types";
import type { CheckoutSession, PaymentProvider, VerifiedPayment } from "./types";

const API = "https://api.flutterwave.com/v3";

function secretKey(): string {
  const key = process.env.FLW_SECRET_KEY;
  if (!key) throw new Error("FLW_SECRET_KEY is not set");
  return key;
}

export const flutterwaveProvider: PaymentProvider = {
  name: "flutterwave",

  async createCheckout(order: Order): Promise<CheckoutSession> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

    const response = await fetch(`${API}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: order.reference,
        amount: order.totalXaf,
        currency: "XAF",
        redirect_url: `${siteUrl}/api/checkout/callback`,
        // Cards for international buyers; mobile money for domestic clinics.
        payment_options: "card,mobilemoneyfranco,banktransfer",
        customer: {
          email: order.customer.email,
          phonenumber: order.customer.phone,
          name: order.customer.name,
        },
        customizations: {
          title: "PharmaSource Cameroun",
          description: `Order ${order.reference}`,
        },
        meta: { facility: order.customer.facility },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Flutterwave checkout failed: ${response.status}`);
    }

    const payload = (await response.json()) as {
      status: string;
      data?: { link: string };
    };
    if (payload.status !== "success" || !payload.data?.link) {
      throw new Error("Flutterwave did not return a payment link");
    }

    return { redirectUrl: payload.data.link, providerRef: order.reference };
  },

  async verify(providerRef: string): Promise<VerifiedPayment> {
    const response = await fetch(
      `${API}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(providerRef)}`,
      {
        headers: { Authorization: `Bearer ${secretKey()}` },
        cache: "no-store",
      }
    );

    const payload = (await response.json()) as {
      status: string;
      data?: { status: string; amount: number; currency: string; tx_ref: string };
    };

    const data = payload.data;
    const successful =
      payload.status === "success" &&
      data?.status === "successful" &&
      data.currency === "XAF";

    return {
      reference: data?.tx_ref ?? providerRef,
      providerRef,
      amountXaf: data?.amount ?? 0,
      successful: Boolean(successful),
    };
  },

  verifyWebhook(_rawBody: string, signature: string | null): boolean {
    // Flutterwave sends the configured hash verbatim in `verif-hash`.
    const expected = process.env.FLW_WEBHOOK_HASH;
    if (!expected || !signature) return false;
    return signature === expected;
  },
};
