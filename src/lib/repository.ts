import fs from 'fs';
import path from 'path';
import type { Product, Order, OrderStatus, ProductCategory, Origin, ColdChain, ProductDraft, Repository } from './types';

// In-memory runtime cache with strict typing
let cachedProducts: Product[] | null = null;
let inMemoryOrders: Order[] = [];

async function loadBaseProducts(): Promise<Product[]> {
  if (cachedProducts) return cachedProducts;

  const filePath = path.join(process.cwd(), 'data', 'Common_Hospital_Injectables.csv');
  if (!fs.existsSync(filePath)) {
    cachedProducts = [];
    return cachedProducts;
  }

  const fileContent = fs.readFileSync(filePath, 'utf8');
  const lines = fileContent.split('\n').filter(Boolean);
  const products: Product[] = [];

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

    products.push({
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
      requiresPrescription: requiresPrescription,
      minsanteRef: 'MINSANTE/2026/AUTH-' + i,
      leadTimeDays: 7,
      description: `${drugName} - ${composition} presentation for institutional distribution.`,
      imageUrl: null,
      updatedAt: new Date().toISOString()
    });
  }

  cachedProducts = products;
  return cachedProducts;
}

export const repository: Repository = {
  async listProducts(): Promise<Product[]> {
    return loadBaseProducts();
  },

  async getProduct(id: string): Promise<Product | null> {
    const products = await loadBaseProducts();
    return products.find((p: Product) => p.id === id) || null;
  },

  async createProduct(draft: ProductDraft): Promise<Product> {
    const products = await loadBaseProducts();
    const newProduct: Product = {
      ...draft,
      id: `inj-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    products.unshift(newProduct);
    return newProduct;
  },

  async updateProduct(id: string, patch: Partial<ProductDraft>): Promise<Product> {
    const products = await loadBaseProducts();
    const index = products.findIndex((p: Product) => p.id === id);
    if (index === -1) throw new Error(`Product not found: ${id}`);

    products[index] = {
      ...products[index],
      ...patch,
      updatedAt: new Date().toISOString()
    };
    return products[index];
  },

  async deleteProduct(id: string): Promise<void> {
    const products = await loadBaseProducts();
    cachedProducts = products.filter((p: Product) => p.id !== id);
  },

  async adjustStock(id: string, delta: number): Promise<Product> {
    const products = await loadBaseProducts();
    const product = products.find((p: Product) => p.id === id);
    if (!product) throw new Error(`Product not found: ${id}`);

    product.stockQty = Math.max(0, product.stockQty + delta);
    product.updatedAt = new Date().toISOString();
    return product;
  },

  async listOrders(): Promise<Order[]> {
    return inMemoryOrders;
  },

  async createOrder(order: Order): Promise<Order> {
    inMemoryOrders.unshift(order);
    return order;
  },

  async updateOrderStatus(
    reference: string,
    status: OrderStatus,
    paymentRef?: string
  ): Promise<Order | null> {
    const order = inMemoryOrders.find((o: Order) => o.reference === reference || o.id === reference);
    if (!order) return null;

    order.status = status;
    if (paymentRef !== undefined) {
      order.paymentRef = paymentRef;
    }
    return order;
  }
};

export async function loadProductsFromCsv(): Promise<Product[]> {
  return repository.listProducts();
}