import fs from 'fs';
import path from 'path';
import type { Product, Order, OrderStatus } from './types';

export const repository = {
  async listProducts(): Promise<Product[]> {
    const filePath = path.join(process.cwd(), 'data', 'Common_Hospital_Injectables.csv');
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lines = fileContent.split('\n').filter(Boolean);
    const products: Product[] = [];

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^"\vert{}"$/g, ''));
      if (row.length < 5) continue;

      const drugName = row[0] || '';
      const genericName = row[1] || '';
      const composition = row[2] || '';
      const form = row[3] || 'Vial';
      const strengthPack = row[4] || '';
      const priceRange = row[5] || '$5';
      const category = row[6] || 'General';

      let baseUsd = 5;
      const match = priceRange.match(/\$?(\d+)/);
      if (match) {
        baseUsd = parseFloat(match[1]);
      }
      const priceXaf = Math.round(baseUsd * 600);

      products.push({
        id: `inj-${i}`,
        name: drugName,
        inn: genericName || composition,
        unit: `${form} (${strengthPack})`,
        category: category,
        priceXaf: priceXaf,
        inStock: true,
        requiresPrescription: category.toLowerCase().includes('antibiotic') || category.toLowerCase().includes('anesthetic') || category.toLowerCase().includes('hormone')
      } as unknown as Product);
    }

    return products;
  },

  async listOrders(): Promise<Order[]> {
    return [];
  },

  async updateOrderStatus(reference: string, status: OrderStatus): Promise<void> {
    // No-op for mock storage
  }
};

/**
 * Standalone export to support pages importing loadProductsFromCsv directly
 */
export async function loadProductsFromCsv(): Promise<Product[]> {
  return repository.listProducts();
}