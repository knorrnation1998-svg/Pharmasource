import { repository } from "@/lib/repository";
import { requireAdmin } from "@/lib/auth";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { ProductForm } from "@/components/admin/ProductForm";
import AdminOrderForm from "@/components/AdminOrderForm";

// Inventory is mutable on every request — never cache this page.
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // Middleware already gated the route; this re-asserts at the data boundary.
  await requireAdmin();
  const products = await repository.listProducts();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-display-md text-manifest-900">
          Inventory & Sales Administration
        </h1>
        <p className="mt-3 max-w-prose text-manifest-600">
          Click a price to edit it. Stock changes save as you click — no separate
          save step, and the public catalogue updates on the next request.
        </p>
      </div>

      <InventoryTable initialProducts={products} />
      
      <div className="border-t border-gray-200 pt-8">
        <AdminOrderForm />
      </div>

      <ProductForm />
    </div>
  );
}