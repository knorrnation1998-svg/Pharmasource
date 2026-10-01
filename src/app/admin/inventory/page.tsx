import { loadProductsFromCsv } from "@/lib/repository";
import { requireAdmin } from "@/lib/auth";
import { formatXaf } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InventoryAdminPage() {
  await requireAdmin();
  const products = await loadProductsFromCsv();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-manifest-900">Master Injectables Inventory</h1>
          <p className="text-sm text-manifest-600">Managing {products.length} global hospital formulations pre-loaded from master records.</p>
        </div>
      </div>

      <div className="sheet bg-white rounded-xl shadow-sm border border-manifest-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-manifest-50 border-b border-manifest-100 text-xs font-semibold text-manifest-500 uppercase">
            <tr>
              <th className="px-6 py-3">Drug / Brand Name</th>
              <th className="px-6 py-3">Generic (INN) / Composition</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Strength & Pack</th>
              <th className="px-6 py-3 text-right">Institutional Price (XAF)</th>
              <th className="px-6 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-manifest-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-manifest-50/50">
                <td className="px-6 py-4 font-medium text-manifest-900">{product.name}</td>
                <td className="px-6 py-4 text-manifest-600">{product.inn}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-800 rounded-full">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-manifest-500">{product.unit}</td>
                <td className="px-6 py-4 text-right font-semibold text-manifest-900">
                  {formatXaf(product.priceXaf)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                    In Stock
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}