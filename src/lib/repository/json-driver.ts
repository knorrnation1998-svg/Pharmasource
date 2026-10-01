import { promises as fs } from "node:fs";
import path from "node:path";
import type { Repository } from "./types";
import type { Order, Product, ProductDraft } from "@/lib/types";
import { newId } from "@/lib/utils";

/**
 * Filesystem driver. Suitable for local development and any host with a
 * writable disk (VPS, Docker, Railway volume, Fly.io volume).
 *
 * NOT suitable for Vercel/Netlify serverless: the bundle filesystem is
 * read-only and /tmp is per-instance and ephemeral. Use the Turso driver
 * there. This is enforced at startup in ./index.ts.
 */

interface Shape {
  products: Product[];
  orders: Order[];
}

const FILE = path.join(process.cwd(), "data", "inventory.json");

/**
 * Serialises writes within a single process so two concurrent Server Actions
 * cannot interleave a read-modify-write and lose one another's changes.
 */
let queue: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function read(): Promise<Shape> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Shape;
  } catch {
    return { products: [], orders: [] };
  }
}

async function write(data: Shape): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  // Write-then-rename keeps the file valid if the process dies mid-write.
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, FILE);
}

export const jsonRepository: Repository = {
  async listProducts() {
    return (await read()).products;
  },

  async getProduct(id) {
    return (await read()).products.find((p) => p.id === id) ?? null;
  },

  createProduct(draft) {
    return withLock(async () => {
      const data = await read();
      const product: Product = {
        ...draft,
        id: newId(),
        updatedAt: new Date().toISOString(),
      };
      data.products.unshift(product);
      await write(data);
      return product;
    });
  },

  updateProduct(id, patch) {
    return withLock(async () => {
      const data = await read();
      const index = data.products.findIndex((p) => p.id === id);
      if (index === -1) throw new Error(`No product with id ${id}`);
      const current = data.products[index]!;
      const next: Product = {
        ...current,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      data.products[index] = next;
      await write(data);
      return next;
    });
  },

  deleteProduct(id) {
    return withLock(async () => {
      const data = await read();
      data.products = data.products.filter((p) => p.id !== id);
      await write(data);
    });
  },

  adjustStock(id, delta) {
    return withLock(async () => {
      const data = await read();
      const index = data.products.findIndex((p) => p.id === id);
      if (index === -1) throw new Error(`No product with id ${id}`);
      const current = data.products[index]!;
      const next: Product = {
        ...current,
        stockQty: Math.max(0, current.stockQty + delta),
        updatedAt: new Date().toISOString(),
      };
      data.products[index] = next;
      await write(data);
      return next;
    });
  },

  async listOrders() {
    return (await read()).orders;
  },

  createOrder(order) {
    return withLock(async () => {
      const data = await read();
      data.orders.unshift(order);
      await write(data);
      return order;
    });
  },

  updateOrderStatus(reference, status, paymentRef) {
    return withLock(async () => {
      const data = await read();
      const index = data.orders.findIndex((o) => o.reference === reference);
      if (index === -1) return null;
      const current = data.orders[index]!;
      const next: Order = {
        ...current,
        status,
        paymentRef: paymentRef ?? current.paymentRef,
      };
      data.orders[index] = next;
      await write(data);
      return next;
    });
  },
};
