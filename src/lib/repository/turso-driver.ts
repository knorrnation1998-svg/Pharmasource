import { createClient, type Client } from "@libsql/client";
import type { Repository } from "./types";
import type { Order, Product, ProductDraft } from "@/lib/types";
import { newId } from "@/lib/utils";

/**
 * libSQL/SQLite driver. Turso's free tier covers this project comfortably and
 * — unlike the JSON driver — works on serverless hosts. adjustStock runs as a
 * single relative UPDATE, so concurrent writers cannot clobber each other.
 */

let client: Client | null = null;

function db(): Client {
  if (client) return client;
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set");
  client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  return client;
}

export async function migrate(): Promise<void> {
  await db().batch(
    [
      `CREATE TABLE IF NOT EXISTS products (
         id TEXT PRIMARY KEY,
         inn TEXT NOT NULL,
         brand_name TEXT,
         category TEXT NOT NULL,
         presentation TEXT NOT NULL,
         manufacturer TEXT NOT NULL,
         origin TEXT NOT NULL,
         hs_code TEXT NOT NULL,
         cold_chain TEXT NOT NULL,
         price_xaf INTEGER NOT NULL,
         stock_qty INTEGER NOT NULL DEFAULT 0,
         reorder_level INTEGER NOT NULL DEFAULT 0,
         requires_prescription INTEGER NOT NULL DEFAULT 1,
         minsante_ref TEXT,
         lead_time_days INTEGER NOT NULL,
         description TEXT NOT NULL,
         image_url TEXT,
         updated_at TEXT NOT NULL
       )`,
      `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
      `CREATE TABLE IF NOT EXISTS orders (
         id TEXT PRIMARY KEY,
         reference TEXT NOT NULL UNIQUE,
         customer_json TEXT NOT NULL,
         lines_json TEXT NOT NULL,
         total_xaf INTEGER NOT NULL,
         status TEXT NOT NULL,
         payment_ref TEXT,
         created_at TEXT NOT NULL
       )`,
    ],
    "write"
  );
}

type Row = Record<string, unknown>;

const toProduct = (r: Row): Product => ({
  id: String(r.id),
  inn: String(r.inn),
  brandName: r.brand_name === null ? null : String(r.brand_name),
  category: r.category as Product["category"],
  presentation: String(r.presentation),
  manufacturer: String(r.manufacturer),
  origin: r.origin as Product["origin"],
  hsCode: String(r.hs_code),
  coldChain: r.cold_chain as Product["coldChain"],
  priceXaf: Number(r.price_xaf),
  stockQty: Number(r.stock_qty),
  reorderLevel: Number(r.reorder_level),
  requiresPrescription: Number(r.requires_prescription) === 1,
  minsanteRef: r.minsante_ref === null ? null : String(r.minsante_ref),
  leadTimeDays: Number(r.lead_time_days),
  description: String(r.description),
  imageUrl: r.image_url === null ? null : String(r.image_url),
  updatedAt: String(r.updated_at),
});

const COLUMN_OF: Record<keyof ProductDraft, string> = {
  inn: "inn",
  brandName: "brand_name",
  category: "category",
  presentation: "presentation",
  manufacturer: "manufacturer",
  origin: "origin",
  hsCode: "hs_code",
  coldChain: "cold_chain",
  priceXaf: "price_xaf",
  stockQty: "stock_qty",
  reorderLevel: "reorder_level",
  requiresPrescription: "requires_prescription",
  minsanteRef: "minsante_ref",
  leadTimeDays: "lead_time_days",
  description: "description",
  imageUrl: "image_url",
};

export const tursoRepository: Repository = {
  async listProducts() {
    const rs = await db().execute("SELECT * FROM products ORDER BY updated_at DESC");
    return rs.rows.map((r) => toProduct(r as Row));
  },

  async getProduct(id) {
    const rs = await db().execute({
      sql: "SELECT * FROM products WHERE id = ?",
      args: [id],
    });
    const row = rs.rows[0];
    return row ? toProduct(row as Row) : null;
  },

  async createProduct(draft) {
    const product: Product = {
      ...draft,
      id: newId(),
      updatedAt: new Date().toISOString(),
    };
    await db().execute({
      sql: `INSERT INTO products
        (id, inn, brand_name, category, presentation, manufacturer, origin,
         hs_code, cold_chain, price_xaf, stock_qty, reorder_level,
         requires_prescription, minsante_ref, lead_time_days, description,
         image_url, updated_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        product.id, product.inn, product.brandName, product.category,
        product.presentation, product.manufacturer, product.origin,
        product.hsCode, product.coldChain, product.priceXaf, product.stockQty,
        product.reorderLevel, product.requiresPrescription ? 1 : 0,
        product.minsanteRef, product.leadTimeDays, product.description,
        product.imageUrl, product.updatedAt,
      ],
    });
    return product;
  },

  async updateProduct(id, patch) {
    const entries = Object.entries(patch) as [keyof ProductDraft, unknown][];
    if (entries.length === 0) {
      const existing = await tursoRepository.getProduct(id);
      if (!existing) throw new Error(`No product with id ${id}`);
      return existing;
    }
    const updatedAt = new Date().toISOString();
    const assignments = entries.map(([key]) => `${COLUMN_OF[key]} = ?`);
    const args = entries.map(([, value]) =>
      typeof value === "boolean" ? (value ? 1 : 0) : (value as never)
    );
    await db().execute({
      sql: `UPDATE products SET ${assignments.join(", ")}, updated_at = ? WHERE id = ?`,
      args: [...args, updatedAt, id],
    });
    const next = await tursoRepository.getProduct(id);
    if (!next) throw new Error(`No product with id ${id}`);
    return next;
  },

  async deleteProduct(id) {
    await db().execute({ sql: "DELETE FROM products WHERE id = ?", args: [id] });
  },

  async adjustStock(id, delta) {
    // Relative update — safe under concurrency, no read-modify-write.
    await db().execute({
      sql: `UPDATE products
            SET stock_qty = MAX(0, stock_qty + ?), updated_at = ?
            WHERE id = ?`,
      args: [delta, new Date().toISOString(), id],
    });
    const next = await tursoRepository.getProduct(id);
    if (!next) throw new Error(`No product with id ${id}`);
    return next;
  },

  async listOrders() {
    const rs = await db().execute("SELECT * FROM orders ORDER BY created_at DESC");
    return rs.rows.map((r) => {
      const row = r as Row;
      return {
        id: String(row.id),
        reference: String(row.reference),
        customer: JSON.parse(String(row.customer_json)) as Order["customer"],
        lines: JSON.parse(String(row.lines_json)) as Order["lines"],
        totalXaf: Number(row.total_xaf),
        status: row.status as Order["status"],
        paymentRef: row.payment_ref === null ? null : String(row.payment_ref),
        createdAt: String(row.created_at),
      };
    });
  },

  async createOrder(order) {
    await db().execute({
      sql: `INSERT INTO orders
        (id, reference, customer_json, lines_json, total_xaf, status, payment_ref, created_at)
        VALUES (?,?,?,?,?,?,?,?)`,
      args: [
        order.id, order.reference, JSON.stringify(order.customer),
        JSON.stringify(order.lines), order.totalXaf, order.status,
        order.paymentRef, order.createdAt,
      ],
    });
    return order;
  },

  async updateOrderStatus(reference, status, paymentRef) {
    await db().execute({
      sql: `UPDATE orders SET status = ?, payment_ref = COALESCE(?, payment_ref)
            WHERE reference = ?`,
      args: [status, paymentRef ?? null, reference],
    });
    const all = await tursoRepository.listOrders();
    return all.find((o) => o.reference === reference) ?? null;
  },
};
