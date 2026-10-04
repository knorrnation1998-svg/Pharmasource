import { repository } from "@/lib/repository";
import { requireAdmin } from "@/lib/auth";
import { InventoryTable } from "@/components/admin/InventoryTable";
import { ProductForm } from "@/components/admin/ProductForm";
import AdminOrderForm from "@/components/AdminOrderForm";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  
  // Fetch products and orders directly on the server
  const products = await repository.listProducts();
  const orders = await repository.listOrders();

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-display text-display-md text-manifest-900">
          Inventory & Sales Administration
        </h1>
        <p className="mt-3 max-w-prose text-manifest-600">
          Click a price to edit it. Stock changes save as you click — no separate save step.
        </p>
      </div>

      <InventoryTable initialProducts={products} />

      {/* SERVER-RENDERED ORDERS LIST — Guaranteed to show what is in Turso */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 my-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Logged Orders & Backdated Transactions ({orders.length})</h3>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders found in database.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Customer / Hospital</th>
                  <th className="p-3">Total (XAF)</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{order.reference}</td>
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-gray-500">{order.hospitalName}</div>
                    </td>
                    <td className="p-3 font-semibold text-blue-600">{order.totalXaf?.toLocaleString()} XAF</td>
                    <td className="p-3 text-xs">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 pt-8">
        <AdminOrderForm />
      </div>

      <ProductForm />
    </div>
  );
}
