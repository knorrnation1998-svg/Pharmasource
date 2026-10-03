import fs from 'fs';
import path from 'path';
import { createClient } from "@libsql/client";
import type { Product, Order, OrderStatus, ProductCategory, Origin, ColdChain, ProductDraft, Repository } from './types';

// Initialize the Turso cloud database client
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Ensure database tables exist and seed from CSV on first run
async function ensureSeeded() {
  // 1. Products / Injectables table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      inn TEXT,
      brand_name TEXT,
      category TEXT,
      presentation TEXT,
      manufacturer TEXT,
      origin TEXT,
      hs_code TEXT,
      cold_chain TEXT,
      price_xaf REAL,
      stock_qty INTEGER,
      reorder_level INTEGER,
      requires_prescription INTEGER,
      minsante_ref TEXT,
      lead_time_days INTEGER,
      description TEXT,
      image_url TEXT,
      updated_at TEXT
    )
  `);

  // 2. Orders & Transactions table (supports manual backdating)
  await db.execute(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      reference TEXT,
      customer_name TEXT,
      hospital_name TEXT,
      status TEXT,
      total_xaf REAL,
      created_at TEXT,
      items TEXT,
      payment_ref TEXT
    )
  `);

  // 3. Admin Users & Authentication table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 4. Customers & Doctors table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      phone_number TEXT,
      hospital_or_facility TEXT NOT NULL,
      address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 5. Dispatch & Logistics Locations table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS dispatch_locations (
      id TEXT PRIMARY KEY,
      location_name TEXT NOT NULL,
      origin TEXT,
      destination TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if products table is empty, if so, seed from CSV
  const res = await db.execute("SELECT COUNT(*) as count FROM products");
  const count = Number(res.rows[0]?.count || 0);

  if (count === 0) {
    const filePath = path.join(process.cwd(), 'data', 'Common_Hospital_Injectables.csv');
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n').filter(Boolean);

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^["']\vert{}["']$/g, ''));
        if (row.length < 5) continue;

        const drugName = row[0] || '';
        const genericName = row[1] || '';
        const composition = row[2] || '';
        const form = row[3] || 'Vial';
        const strengthPack = row[4] || '';
        const priceRange = row[5] || '$5';
        const categoryStr = (row[6] || 'General').toLowerCase();

        let baseUsd = 5;
        const match = priceRange.match(/\$?(\d+)/);
        if (match) {
          baseUsd = parseFloat(match[1]);
        }
        const priceXaf = Math.round(baseUsd * 600);

        let category: ProductCategory = 'specialised-injection';
        if (categoryStr.includes('rare')) category = 'rare-drug';
        else if (categoryStr.includes('diagnostic')) category = 'diagnostic-reagent';
        else if (categoryStr.includes('cold') || categoryStr.includes('biologic')) category = 'cold-chain-biologic';

        const requiresPrescription = categoryStr.includes('antibiotic') || categoryStr.includes('anesthetic') || categoryStr.includes('hormone');

        const product = {
          id: `inj-${i}`,
          inn: genericName || composition || drugName,
          brandName: drugName || null,
          category: category,
          presentation: `${form} (${strengthPack})`,
          manufacturer: 'Standard Pharma',
          origin: 'FR' as Origin,
          hsCode: '3004.90',
          coldChain: '2-8C' as ColdChain,
          priceXaf: priceXaf,
          stockQty: 150,
          reorderLevel: 20,
          requiresPrescription: requiresPrescription ? 1 : 0,
          minsanteRef: 'MINSANTE/2026/AUTH-' + i,
          leadTimeDays: 7,
          description: `${drugName} - ${composition} presentation for institutional distribution.`,
          imageUrl: null,
          updatedAt: new Date().toISOString()
        };

        await db.execute({
          sql: `INSERT OR IGNORE INTO products (id, inn, brand_name, category, presentation, manufacturer, origin, hs_code, cold_chain, price_xaf, stock_qty, reorder_level, requires_prescription, minsante_ref, lead_time_days, description, image_url, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            product.id, product.inn, product.brandName, product.category, product.presentation,
            product.manufacturer, product.origin, product.hsCode, product.coldChain, product.priceXaf,
            product.stockQty, product.reorderLevel, product.requiresPrescription, product.minsanteRef,
            product.leadTimeDays, product.description, product.imageUrl, product.updatedAt
          ]
        });
      }
    }
  }
}

function rowToProduct(row: any): Product {
  return {
    id: String(row.id),
    inn: String(row.inn),
    brandName: row.brand_name ? String(row.brand_name) : null,
    category: String(row.category) as ProductCategory,
    presentation: String(row.presentation),
    manufacturer: String(row.manufacturer),
    origin: String(row.origin) as Origin,
    hsCode: String(row.hs_code),
    coldChain: String(row.cold_chain) as ColdChain,
    priceXaf: Number(row.price_xaf),
    stockQty: Number(row.stock_qty),
    reorderLevel: Number(row.reorder_level),
    requiresPrescription: Boolean(row.requires_prescription),
    minsanteRef: String(row.minsante_ref),
    leadTimeDays: Number(row.lead_time_days),
    description: String(row.description),
    imageUrl: row.image_url ? String(row.image_url) : null,
    updatedAt: String(row.updated_at)
  };
}

export const repository: Repository = {
  async listProducts(): Promise<Product[]> {
    await ensureSeeded();
    const rs = await db.execute("SELECT * FROM products ORDER BY rowid DESC");
    return rs.rows.map(rowToProduct);
  },

  async getProduct(id: string): Promise<Product | null> {
    await ensureSeeded();
    const rs = await db.execute({
      sql: "SELECT * FROM products WHERE id = ?",
      args: [id]
    });
    if (rs.rows.length === 0) return null;
    return rowToProduct(rs.rows[0]);
  },

  async createProduct(draft: ProductDraft): Promise<Product> {
    await ensureSeeded();
    const newId = `inj-${Date.now()}`;
    const updatedAt = new Date().toISOString();
    const newProduct: Product = {
      ...draft,
      id: newId,
      updatedAt
    };

    await db.execute({
      sql: `INSERT INTO products (id, inn, brand_name, category, presentation, manufacturer, origin, hs_code, cold_chain, price_xaf, stock_qty, reorder_level, requires_prescription, minsante_ref, lead_time_days, description, image_url, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        newProduct.id, newProduct.inn, newProduct.brandName, newProduct.category, newProduct.presentation,
        newProduct.manufacturer, newProduct.origin, newProduct.hsCode, newProduct.coldChain, newProduct.priceXaf,
        newProduct.stockQty, newProduct.reorderLevel, newProduct.requiresPrescription ? 1 : 0, newProduct.minsanteRef,
        newProduct.leadTimeDays, newProduct.description, newProduct.imageUrl, newProduct.updatedAt
      ]
    });

    return newProduct;
  },

  async updateProduct(id: string, patch: Partial<ProductDraft>): Promise<Product> {
    const existing = await this.getProduct(id);
    if (!existing) throw new Error(`Product not found: ${id}`);

    const updated: Product = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString()
    };

    await db.execute({
      sql: `UPDATE products SET inn = ?, brand_name = ?, category = ?, presentation = ?, manufacturer = ?, origin = ?, hs_code = ?, cold_chain = ?, price_xaf = ?, stock_qty = ?, reorder_level = ?, requires_prescription = ?, minsante_ref = ?, lead_time_days = ?, description = ?, image_url = ?, updated_at = ? WHERE id = ?`,
      args: [
        updated.inn, updated.brandName, updated.category, updated.presentation,
        updated.manufacturer, updated.origin, updated.hsCode, updated.coldChain, updated.priceXaf,
        updated.stockQty, updated.reorderLevel, updated.requiresPrescription ? 1 : 0, updated.minsanteRef,
        updated.leadTimeDays, updated.description, updated.imageUrl, updated.updatedAt, id
      ]
    });

    return updated;
  },

  async deleteProduct(id: string): Promise<void> {
    await db.execute({
      sql: "DELETE FROM products WHERE id = ?",
      args: [id]
    });
  },

  async adjustStock(id: string, delta: number): Promise<Product> {
    const product = await this.getProduct(id);
    if (!product) throw new Error(`Product not found: ${id}`);

    const newStock = Math.max(0, product.stockQty + delta);
    return this.updateProduct(id, { stockQty: newStock });
  },

  async listOrders(): Promise<Order[]> {
    await ensureSeeded();
    const rs = await db.execute("SELECT * FROM orders ORDER BY rowid DESC");
    return rs.rows.map((row: any) => ({
      id: String(row.id),
      reference: String(row.reference),
      customerName: String(row.customer_name),
      hospitalName: String(row.hospital_name),
      status: String(row.status) as OrderStatus,
      totalXaf: Number(row.total_xaf),
      createdAt: String(row.created_at),
      items: JSON.parse(String(row.items || '[]')),
      paymentRef: row.payment_ref ? String(row.payment_ref) : undefined
    }));
  },

  async createOrder(order: Order): Promise<Order> {
    await ensureSeeded();
    await db.execute({
      sql: `INSERT INTO orders (id, reference, customer_name, hospital_name, status, total_xaf, created_at, items, payment_ref) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        order.id,
        order.reference,
        order.customerName,
        order.hospitalName,
        order.status,
        order.totalXaf,
        order.createdAt,
        JSON.stringify(order.items),
        order.paymentRef || null
      ]
    });
    return order;
  },

  async updateOrderStatus(
    reference: string,
    status: OrderStatus,
    paymentRef?: string
  ): Promise<Order | null> {
    await ensureSeeded();
    const rs = await db.execute({
      sql: "SELECT * FROM orders WHERE reference = ? OR id = ?",
      args: [reference, reference]
    });
    if (rs.rows.length === 0) return null;

    const row = rs.rows[0];
    const orderId = String(row.id);
    const newPaymentRef = paymentRef !== undefined ? paymentRef : row.payment_ref;

    await db.execute({
      sql: "UPDATE orders SET status = ?, payment_ref = ? WHERE id = ?",
      args: [status, newPaymentRef || null, orderId]
    });

    const updatedRs = await db.execute({
      sql: "SELECT * FROM orders WHERE id = ?",
      args: [orderId]
    });
    const uRow = updatedRs.rows[0];

    return {
      id: String(uRow.id),
      reference: String(uRow.reference),
      customerName: String(uRow.customer_name),
      hospitalName: String(uRow.hospital_name),
      status: String(uRow.status) as OrderStatus,
      totalXaf: Number(uRow.total_xaf),
      createdAt: String(uRow.created_at),
      items: JSON.parse(String(uRow.items || '[]')),
      paymentRef: uRow.payment_ref ? String(uRow.payment_ref) : undefined
    };
  }
};

export async function loadProductsFromCsv(): Promise<Product[]> {
  return repository.listProducts();
}