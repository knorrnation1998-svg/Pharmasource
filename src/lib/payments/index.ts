import "server-only";
import type { PaymentProvider } from "./types";
import { flutterwaveProvider } from "./flutterwave";

/**
 * Add a Stripe driver here if the business later incorporates in the EU/US.
 * The port is deliberately narrow so a second provider is a new file, not a
 * refactor of the checkout flow.
 */
export function paymentProvider(): PaymentProvider {
  const name = process.env.PAYMENT_PROVIDER ?? "flutterwave";
  switch (name) {
    case "flutterwave":
      return flutterwaveProvider;
    default:
      throw new Error(`Unknown PAYMENT_PROVIDER: ${name}`);
  }
}

export type { PaymentProvider, CheckoutSession, VerifiedPayment } from "./types";
