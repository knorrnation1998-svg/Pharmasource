import type { Order, Product, ProductDraft } from "@/lib/types";

/**
 * Persistence port. Swapping drivers must never require touching a Server
 * Action, a component, or a hook — only the DATA_DRIVER env var.
 */
export interface Repository {
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(draft: ProductDraft): Promise<Product>;
  updateProduct(id: string, patch: Partial<ProductDraft>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  /** Atomic relative adjustment — avoids read-modify-write races. */
  adjustStock(id: string, delta: number): Promise<Product>;

  listOrders(): Promise<Order[]>;
  createOrder(order: Order): Promise<Order>;
  updateOrderStatus(
    reference: string,
    status: Order["status"],
    paymentRef?: string
  ): Promise<Order | null>;
}
