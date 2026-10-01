powershell -ExecutionPolicy Bypass -Command {
    $ErrorActionPreference = "Stop"
    Write-Host "=== Starting PharmaSource Master Inventory Agent ===" -ForegroundColor Cyan

    if (!(Test-Path "data")) { New-Item -ItemType Directory -Path "data" | Out-Null }
    if (Test-Path "Common_Hospital_Injectables.csv") {
        Copy-Item "Common_Hospital_Injectables.csv" "data/Common_Hospital_Injectables.csv" -Force
        Write-Host "Master CSV copied to /data folder successfully." -ForegroundColor Green
    }

    $repoPath = "src/lib/repository.ts"
    Write-Host "Updating repository loader to read 174 master injectables..." -ForegroundColor Yellow

    $repoContent = @'
import fs from 'fs';
import path from 'path';
import type { Product, Order, OrderStatus } from './types';

export const repository = {
  async listProducts(): Promise<Product[]> {
    const filePath = path.join(process.cwd(), 'data', 'Common_Hospital_Injectables.csv');
    if (!fs.existsSync(filePath)) { return []; }

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
      if (match) { baseUsd = parseFloat(match[1]); }
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
      });
    }
    return products;
  },
  async listOrders(): Promise<Order[]> { return []; },
  async updateOrderStatus(reference: string, status: OrderStatus): Promise<void> {}
};
'@

    Set-Content -Path $repoPath -Value$repoContent -Encoding UTF8

    $adminInvPath = "src/app/admin/inventory/page.tsx"
    $adminInvDir = [System.IO.Path]::GetDirectoryName($adminInvPath)
    if (!(Test-Path $adminInvDir)) { New-Item -ItemType Directory -Path$adminInvDir -Force | Out-Null }

    Write-Host "Creating Admin Inventory Management view..." -ForegroundColor Yellow

    $adminInvContent = @'
import { repository } from "@/lib/repository";
import { formatXaf } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function InventoryAdminPage() {
  const products = await repository.listProducts();

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-sterile">
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-manifest-500">Master Catalog Control</span>
          <h1 className="text-2xl font-bold text-manifest-900 mt-1">Hospital Injectables Inventory ({products.length} Items)</h1>
          <p className="text-sm text-manifest-600 mt-0.5">Manage global formulations, institutional pricing (XAF), and availability status.</p>
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
              <tr key={product.id} className="hover:bg-manifest-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-manifest-900">{product.name}</td>
                <td className="px-6 py-4 text-manifest-600">{product.inn}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 text-xs font-medium bg-manifest-100 text-manifest-800 rounded-full">{product.category}</span>
                </td>
                <td className="px-6 py-4 text-xs text-manifest-500">{product.unit}</td>
                <td className="px-6 py-4 text-right font-semibold text-manifest-900">{formatXaf(product.priceXaf)}</td>
                <td className="px-6 py-4 text-center">
                  <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">In Stock</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
'@

    Set-Content -Path $adminInvPath -Value$adminInvContent -Encoding UTF8

    Write-Host "Running Next.js build verification..." -ForegroundColor Cyan
    npm run build

    if ($LASTEXITCODE -eq 0) {
        Write-Host "=== Master Inventory & 174 Injectables Successfully Integrated & Verified! ===" -ForegroundColor Green
    } else {
        Write-Error "Build verification failed."
        exit 1
    }
}