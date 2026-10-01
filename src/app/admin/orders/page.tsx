import { repository } from "@/lib/repository";
import { requireAdmin } from "@/lib/auth";
import { formatXaf } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";
import { updateOrderStatusAction } from "@/server/actions/orders";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  "awaiting-payment": "Awaiting payment",
  paid: "Paid",
  sourcing: "Sourcing",
  "in-transit": "In transit",
  customs: "At customs",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const ALL_STATUSES: OrderStatus[] = [
  "awaiting-payment",
  "paid",
  "sourcing",
  "in-transit",
  "customs",
  "delivered",
  "cancelled",
];

export default async function OrdersPage() {
  await requireAdmin();
  const orders = await repository.listOrders();

  return (
    <div>
      <h1 className="font-display text-display-md text-manifest-900">Orders & Fulfillment Pipeline</h1>

      <div className="sheet mt-8 overflow-x-auto shadow-sheet">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-manifest-100 text-left text-xs font-medium text-manifest-400">
              <th scope="col" className="px-5 py-3">Reference</th>
              <th scope="col" className="px-5 py-3">Facility / Contact</th>
              <th scope="col" className="px-5 py-3">Lines</th>
              <th scope="col" className="px-5 py-3 text-right">Total</th>
              <th scope="col" className="px-5 py-3">Fulfillment Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center text-manifest-400">
                  No orders yet.
                </td>
              </tr>
            )}
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-manifest-100">
                <td className="px-5 py-4 font-code text-[11px] text-manifest-600">
                  {order.reference}
                </td>
                <td className="px-5 py-4">
                  <p className="font-medium text-manifest-800">
                    {order.customer.facility}
                  </p>
                  <p className="mt-0.5 text-xs text-manifest-400">
                    {order.customer.name} ({order.customer.phone})
                  </p>
                </td>
                <td className="px-5 py-4 tabular text-manifest-600">
                  {order.lines.length} items
                </td>
                <td className="px-5 py-4 tabular text-right font-medium text-manifest-900">
                  {formatXaf(order.totalXaf)}
                </td>
                <td className="px-5 py-4">
                  <form 
                    action={async (formData) => {
                      "use server";
                      const newStatus = formData.get("status") as OrderStatus;
                      await updateOrderStatusAction(order.reference, newStatus);
                    }}
                    className="flex items-center gap-2"
                  >
                    <select
                      name="status"
                      defaultValue={order.status}
                      className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-800 font-medium focus:ring-1 focus:ring-slate-900"
                    >
                      {ALL_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABEL[status]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="text-xs bg-slate-900 text-white px-2.5 py-1 rounded hover:bg-slate-800 transition-colors"
                    >
                      Update
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}