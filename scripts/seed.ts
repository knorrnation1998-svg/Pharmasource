/**
 * Seeds the Turso database from data/inventory.json.
 * Run once after provisioning:  npm run seed
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { migrate, tursoRepository } from "../src/lib/repository/turso-driver";
import type { Product } from "../src/lib/types";

async function main() {
  await migrate();

  const raw = await fs.readFile(
    path.join(process.cwd(), "data", "inventory.json"),
    "utf8"
  );
  const { products } = JSON.parse(raw) as { products: Product[] };

  const existing = await tursoRepository.listProducts();
  if (existing.length > 0) {
    console.log(`Skipped: ${existing.length} products already present.`);
    return;
  }

  for (const product of products) {
    const { id: _id, updatedAt: _updatedAt, ...draft } = product;
    await tursoRepository.createProduct(draft);
  }

  console.log(`Seeded ${products.length} products.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
