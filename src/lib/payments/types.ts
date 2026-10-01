import type { Order } from "@/lib/types";

export interface CheckoutSession {
  /** URL to redirect the buyer to. */
  redirectUrl: string;
  providerRef: string;
}

export interface VerifiedPayment {
  reference: string;
  providerRef: string;
  amountXaf: number;
  successful: boolean;
}

/**
 * Payment port. Cameroon-specific note: Stripe does not onboard merchants
 * registered in Cameroon, and Paystack covers NG/GH/ZA/KE only. Flutterwave
 * is the working default here because it settles XAF and supports MTN Mobile
 * Money and Orange Money alongside international cards.
 */
export interface PaymentProvider {
  readonly name: string;
  createCheckout(order: Order): Promise<CheckoutSession>;
  /** Verify server-side. Never trust the redirect query string. */
  verify(providerRef: string): Promise<VerifiedPayment>;
  /** Validate the webhook signature/hash before acting on the payload. */
  verifyWebhook(rawBody: string, signature: string | null): boolean;
}
