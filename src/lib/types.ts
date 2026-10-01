/**
 * Domain model. Every exported type here is the single source of truth —
 * Server Actions, repository drivers and UI all consume these.
 */

export type Origin = "US" | "FR" | "DE" | "CH" | "BE" | "UK" | "NL";

export type ProductCategory =
  | "rare-drug"
  | "specialised-injection"
  | "diagnostic-reagent"
  | "cold-chain-biologic";

export type StockStatus = "in-stock" | "low-stock" | "on-order" | "unavailable";

/** Cold-chain band required through transit and storage, in Celsius. */
export type ColdChain = "ambient" | "2-8C" | "-20C" | "-70C";

export interface Product {
  id: string;
  /** International Non-proprietary Name, e.g. "Eculizumab". */
  inn: string;
  brandName: string | null;
  category: ProductCategory;
  /** Manufacturer's presentation, e.g. "300 mg / 30 mL vial". */
  presentation: string;
  manufacturer: string;
  origin: Origin;
  /** Harmonised System tariff code used on the Douala customs declaration. */
  hsCode: string;
  coldChain: ColdChain;
  /** Price in XAF (Central African CFA franc). Integer — XAF has no minor unit. */
  priceXaf: number;
  stockQty: number;
  /** Below this, the UI flags "low-stock" and the admin table warns. */
  reorderLevel: number;
  requiresPrescription: boolean;
  /** MINSANTE import authorisation reference, null while pending. */
  minsanteRef: string | null;
  leadTimeDays: number;
  description: string;
  imageUrl: string | null;
  updatedAt: string;
}

export type ProductDraft = Omit<Product, "id" | "updatedAt">;

export function stockStatus(
  p: Pick<Product, "stockQty" | "reorderLevel">
): StockStatus {
  if (p.stockQty <= 0) return "on-order";
  if (p.stockQty <= p.reorderLevel) return "low-stock";
  return "in-stock";
}

export interface Session {
  sub: string;
  email: string;
  role: "admin" | "viewer";
}

export interface OrderLine {
  productId: string;
  inn: string;
  qty: number;
  unitPriceXaf: number;
}

export type OrderStatus =
  | "awaiting-payment"
  | "paid"
  | "sourcing"
  | "in-transit"
  | "customs"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  reference: string;
  customer: { name: string; email: string; phone: string; facility: string };
  lines: OrderLine[];
  totalXaf: number;
  status: OrderStatus;
  paymentRef: string | null;
  createdAt: string;
}

/** Discriminated result returned by every Server Action. */
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

/** Cart item model for client-side basket management */
export interface CartItem {
  id: string;
  sku: string;
  name: string;
  priceXaf: number;
  quantity: number;
  requiresPrescription: boolean;
  unit: string;
  imageUrl?: string | null;
}