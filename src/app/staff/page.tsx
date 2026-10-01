"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  reference: string;
  hospital: string;
  contact: string;
  phone: string;
  dispatch: string;
  amount: number;
  status: "Pending" | "Dispatched" | "Delivered";
  date: string;
}

interface StaffSession {
  email: string;
  name: string;
  role: string;
  hub: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  priceXaf: number;
  hub: string;
  stock: number;
}

interface HubLocation {
  id: string;
  name: string;
  region: string;
  coldChainCapable: boolean;
}

type Currency = "XAF" | "USD" | "EUR";

const EXCHANGE_RATES: Record<Currency, { rate: number; symbol: string }> = {
  XAF: { rate: 1, symbol: "FCFA" },
  USD: { rate: 0.0016, symbol: "$" },
  EUR: { rate: 0.0015, symbol: "€" },
};

export default function StaffPortalPage() {
  const router = useRouter();
  const [staffProfile, setStaffProfile] = useState<StaffSession | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "inventory" | "locations">("orders");
  const [currency, setCurrency] = useState<Currency>("XAF");
  
  // Receipt modal state
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  useEffect(() => {
    const session = localStorage.getItem("keyani_staff_session");
    if (session) {
      try {
        setStaffProfile(JSON.parse(session));
      } catch (e) {
        console.error("Failed to parse staff session", e);
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("keyani_staff_session");
    router.push("/auth/login");
  };

  // --- Inventory State ---
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("keyani_inventory");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return [
      { id: "INV-01", name: "Ceftriaxone 1g Injectable", category: "Antibiotics", priceXaf: 47500, hub: "Douala Central", stock: 1200 },
      { id: "INV-02", name: "Insulin Regular (Cold-Chain 2°C-8°C)", category: "Biologics", priceXaf: 185000, hub: "Yaoundé Express", stock: 450 },
      { id: "INV-03", name: "Paracetamol 500mg IV Infusion", category: "Analgesics", priceXaf: 22000, hub: "Douala Central", stock: 3400 },
    ];
  });

  useEffect(() => {
    localStorage.setItem("keyani_inventory", JSON.stringify(inventory));
  }, [inventory]);

  // --- Hubs State ---
  const [hubs, setHubs] = useState<HubLocation[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("keyani_hubs");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { /* fallback */ }
      }
    }
    return [
      { id: "hub-1", name: "Douala Central", region: "Littoral", coldChainCapable: true },
      { id: "hub-2", name: "Yaoundé Express", region: "Centre", coldChainCapable: true },
      { id: "hub-3", name: "Bafoussam Regional Depot", region: "West", coldChainCapable: false },
    ];
  });

  useEffect(() => {
    localStorage.setItem("keyani_hubs", JSON.stringify(hubs));
  }, [hubs]);

  // --- Orders State ---
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-9012",
      reference: "KEYANI_489210",
      hospital: "Hôpital Général de Douala",
      contact: "Dr. Manga Bell",
      phone: "+237 670000001",
      dispatch: "Douala Central",
      amount: 47500,
      status: "Pending",
      date: "2026-10-01 10:30",
    },
    {
      id: "ORD-9011",
      reference: "KEYANI_102938",
      hospital: "Centre Hospitalier Universitaire (CHU) Yaoundé",
      contact: "Dr. Nkou Essomba",
      phone: "+237 690000042",
      dispatch: "Yaoundé Express",
      amount: 185000,
      status: "Dispatched",
      date: "2026-10-01 09:15",
    },
  ]);

  // --- Form States ---
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Antibiotics");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemHub, setNewItemHub] = useState("Douala Central");
  const [newItemStock, setNewItemStock] = useState("");

  const [newHubName, setNewHubName] = useState("");
  const [newHubRegion, setNewHubRegion] = useState("");
  const [newHubColdChain, setNewHubColdChain] = useState(true);

  const formatPrice = (amountInXaf: number) => {
    const { rate, symbol } = EXCHANGE_RATES[currency];
    const converted = amountInXaf * rate;
    if (currency === "XAF") {
      return `${converted.toLocaleString()} XAF`;
    }
    return `${symbol}${converted.toFixed(2)}`;
  };

  // --- Export CSV Functions ---
  const exportOrdersCSV = () => {
    const headers = "OrderID,Reference,Hospital,Contact,Phone,Hub,AmountXAF,Status,Date\n";
    const rows = orders.map(o => `"${o.id}","${o.reference}","${o.hospital}","${o.contact}","${o.phone}","${o.dispatch}",${o.amount},"${o.status}","${o.date}"`).join("\n");
    downloadCSV(headers + rows, "keyani_orders_manifest.csv");
  };

  const exportInventoryCSV = () => {
    const headers = "ItemID,Name,Category,PriceXAF,Hub,Stock\n";
    const rows = inventory.map(i => `"${i.id}","${i.name}","${i.category}",${i.priceXaf},"${i.hub}",${i.stock}`).join("\n");
    downloadCSV(headers + rows, "keyani_inventory_catalog.csv");
  };

  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    const item: InventoryItem = {
      id: `INV-${Date.now().toString().slice(-4)}`,
      name: newItemName,
      category: newItemCategory,
      priceXaf: parseFloat(newItemPrice),
      hub: newItemHub,
      stock: parseInt(newItemStock) || 100,
    };
    setInventory([item, ...inventory]);
    setNewItemName("");
    setNewItemPrice("");
    setNewItemStock("");
    alert("New inventory item successfully added!");
  };

  const handleAddHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHubName || !newHubRegion) return;
    const hub: HubLocation = {
      id: `hub-${Date.now().toString().slice(-4)}`,
      name: newHubName,
      region: newHubRegion,
      coldChainCapable: newHubColdChain,
    };
    setHubs([...hubs, hub]);
    setNewHubName("");
    setNewHubRegion("");
    alert("New dispatch hub successfully added!");
  };

  return (
    <div className="min-h-screen bg-sterile py-10 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-manifest-200 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Internal Operations & Administration</span>
            <h1 className="text-3xl font-bold text-manifest-900 mt-1">Keyani Staff & Fulfillment Portal</h1>
            <p className="text-sm text-manifest-600 mt-1">Manage hospital manifests, catalog inventory, pricing, and distribution hubs.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-2 rounded-xl border border-manifest-200 flex items-center gap-2 shadow-sm">
              <span className="text-xs font-semibold text-manifest-500">Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="text-xs font-bold text-manifest-900 bg-transparent focus:outline-none"
              >
                <option value="XAF">XAF (FCFA)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>

            <div className="bg-white px-4 py-2 rounded-xl border border-manifest-200 text-xs text-manifest-700 shadow-sm space-y-0.5">
              <div className="font-semibold text-manifest-900">{staffProfile?.name || "Authorized Staff"} ({staffProfile?.role || "Administrator"})</div>
              <div className="text-[11px] text-manifest-500">Hub: <span className="text-emerald-700 font-medium">{staffProfile?.hub || "Douala Central"}</span></div>
            </div>

            <button
              onClick={handleSignOut}
              className="bg-manifest-100 hover:bg-manifest-200 text-manifest-800 font-semibold px-3.5 py-2.5 rounded-xl text-xs transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Navigation & Export Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-manifest-200 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "orders" ? "bg-manifest-900 text-white shadow-sm" : "bg-white text-manifest-700 hover:bg-manifest-100"}`}
            >
              📦 Hospital Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "inventory" ? "bg-manifest-900 text-white shadow-sm" : "bg-white text-manifest-700 hover:bg-manifest-100"}`}
            >
              💊 Catalog & Inventory ({inventory.length})
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === "locations" ? "bg-manifest-900 text-white shadow-sm" : "bg-white text-manifest-700 hover:bg-manifest-100"}`}
            >
              📍 Dispatch Hubs ({hubs.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportOrdersCSV}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              📥 Export Orders CSV
            </button>
            <button
              onClick={exportInventoryCSV}
              className="bg-manifest-800 hover:bg-manifest-900 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5"
            >
              📥 Export Inventory CSV
            </button>
          </div>
        </div>

        {/* TAB 1: ORDERS */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl shadow-sm border border-manifest-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-manifest-50/70 border-b border-manifest-200 text-xs font-semibold text-manifest-600 uppercase tracking-wider">
                  <th className="py-4 px-6">Order ID & Ref</th>
                  <th className="py-4 px-4">Hospital / Contact</th>
                  <th className="py-4 px-4">Assigned Hub</th>
                  <th className="py-4 px-4">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions / Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-manifest-100 text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-manifest-50/40">
                    <td className="py-4 px-6">
                      <div className="font-bold text-manifest-900">{order.id}</div>
                      <div className="text-[11px] font-mono text-manifest-500">{order.reference}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-manifest-900 text-xs">{order.hospital}</div>
                      <div className="text-xs text-manifest-600">{order.contact} ({order.phone})</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 bg-manifest-100 text-manifest-800 text-[11px] font-semibold rounded-lg">{order.dispatch}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-manifest-900">{formatPrice(order.amount)}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        order.status === "Pending" ? "bg-amber-50 text-amber-800 border border-amber-200" :
                        order.status === "Dispatched" ? "bg-blue-50 text-blue-800 border border-blue-200" :
                        "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}>{order.status}</span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrderForReceipt(order)}
                        className="bg-manifest-100 hover:bg-manifest-200 text-manifest-800 px-3 py-1.5 rounded-lg text-xs font-semibold"
                      >
                        📄 Receipt / Proof
                      </button>
                      {order.status === "Pending" && (
                        <button
                          onClick={() => setOrders(orders.map(o => o.id === order.id ? { ...o, status: "Dispatched" } : o))}
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-500"
                        >
                          Dispatch
                        </button>
                      )}
                      {order.status === "Dispatched" && (
                        <button
                          onClick={() => setOrders(orders.map(o => o.id === order.id ? { ...o, status: "Delivered" } : o))}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-emerald-500"
                        >
                          Deliver
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: INVENTORY */}
        {activeTab === "inventory" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-manifest-100 space-y-4 h-fit">
              <h3 className="font-bold text-manifest-900 text-base">Add New Catalog Item</h3>
              <form onSubmit={handleAddItem} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-manifest-700 uppercase mb-1">Item Name</label>
                  <input type="text" required value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g. Amoxicillin 500mg" className="w-full px-3 py-2 rounded-xl border border-manifest-200 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-manifest-700 uppercase mb-1">Category</label>
                  <input type="text" value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-manifest-200 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-manifest-700 uppercase mb-1">Price (in XAF)</label>
                  <input type="number" required value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="e.g. 15000" className="w-full px-3 py-2 rounded-xl border border-manifest-200 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-manifest-700 uppercase mb-1">Assigned Hub</label>
                  <select value={newItemHub} onChange={(e) => setNewItemHub(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-manifest-200 text-xs bg-white">
                    {hubs.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-manifest-700 uppercase mb-1">Initial Stock</label>
                  <input type="number" value={newItemStock} onChange={(e) => setNewItemStock(e.target.value)} placeholder="e.g. 500" className="w-full px-3 py-2 rounded-xl border border-manifest-200 text-xs" />
                </div>
                <button type="submit" className="w-full bg-manifest-900 hover:bg-manifest-800 text-white font-semibold py-2.5 rounded-xl text-xs shadow-sm transition-all">Add Item to Catalog</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-manifest-100 overflow-hidden">
              <div className="p-4 bg-manifest-50/70 border-b border-manifest-200 font-bold text-manifest-900 text-xs uppercase">Active Catalog & Price Manager</div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-manifest-200 text-[11px] font-semibold text-manifest-600 uppercase">
                    <th className="py-3 px-4">Item & Category</th>
                    <th className="py-3 px-4">Price ({currency})</th>
                    <th className="py-3 px-4">Hub Location</th>
                    <th className="py-3 px-4">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-manifest-100 text-xs">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-manifest-50/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-manifest-900">{item.name}</div>
                        <div className="text-[11px] text-manifest-500">{item.category}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={item.priceXaf}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setInventory(inventory.map(i => i.id === item.id ? { ...i, priceXaf: val } : i));
                            }}
                            className="w-28 px-2 py-1 rounded-lg border border-manifest-200 text-xs font-bold text-manifest-900"
                          />
                          <span className="text-[10px] text-manifest-500">({formatPrice(item.priceXaf)})</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={item.hub}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInventory(inventory.map(i => i.id === item.id ? { ...i, hub: val } : i));
                          }}
                          className="px-2 py-1 rounded-lg border border-manifest-200 text-xs bg-white font-medium text-manifest-800"
                        >
                          {hubs.map(h => <option key={h.id} value={h.name}>{h.name}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">{item.stock} units</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: LOCATIONS */}
        {activeTab === "locations" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-manifest-100 space-y-4 h-fit">
              <h3 className="font-bold text-manifest-900 text-base">Add New Hub / Location</h3>
              <form onSubmit={handleAddHub} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-manifest-700 uppercase mb-1">Hub Name</label>
                  <input type="text" required value={newHubName} onChange={(e) => setNewHubName(e.target.value)} placeholder="e.g. Garoua Northern Depot" className="w-full px-3 py-2 rounded-xl border border-manifest-200 text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-manifest-700 uppercase mb-1">Region</label>
                  <input type="text" required value={newHubRegion} onChange={(e) => setNewHubRegion(e.target.value)} placeholder="e.g. North Region" className="w-full px-3 py-2 rounded-xl border border-manifest-200 text-xs" />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" id="coldChain" checked={newHubColdChain} onChange={(e) => setNewHubColdChain(e.target.checked)} className="rounded border-manifest-300" />
                  <label htmlFor="coldChain" className="text-xs font-medium text-manifest-800">Cold-Chain Capable (2°C - 8°C)</label>
                </div>
                <button type="submit" className="w-full bg-manifest-900 hover:bg-manifest-800 text-white font-semibold py-2.5 rounded-xl text-xs shadow-sm transition-all mt-2">Register Hub Location</button>
              </form>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {hubs.map((hub) => (
                <div key={hub.id} className="bg-white p-5 rounded-2xl shadow-sm border border-manifest-100 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-manifest-900 text-sm">{hub.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${hub.coldChainCapable ? "bg-blue-50 text-blue-700 border border-blue-200" : "bg-manifest-100 text-manifest-600"}`}>
                      {hub.coldChainCapable ? "❄️ Cold-Chain Ready" : "📦 Standard Storage"}
                    </span>
                  </div>
                  <p className="text-xs text-manifest-600">Region: <strong className="text-manifest-800">{hub.region}</strong></p>
                  <p className="text-[11px] text-manifest-400 font-mono">Hub ID: {hub.id}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* RECEIPT / PROOF OF PAYMENT MODAL */}
      {selectedOrderForReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-xl border border-manifest-200">
            <div className="text-center border-b border-manifest-100 pb-4 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Keyani Supply Solutions — Cameroon</span>
              <h2 className="text-xl font-bold text-manifest-900">Official Proof of Payment & Receipt</h2>
              <p className="text-xs text-manifest-500">Secure Institutional Procurement Voucher</p>
            </div>

            <div className="space-y-3 text-xs text-manifest-700">
              <div className="flex justify-between border-b border-manifest-100 pb-2">
                <span className="text-manifest-500">Order ID:</span>
                <span className="font-bold text-manifest-900">{selectedOrderForReceipt.id}</span>
              </div>
              <div className="flex justify-between border-b border-manifest-100 pb-2">
                <span className="text-manifest-500">Transaction Reference:</span>
                <span className="font-mono font-bold text-manifest-900">{selectedOrderForReceipt.reference}</span>
              </div>
              <div className="flex justify-between border-b border-manifest-100 pb-2">
                <span className="text-manifest-500">Hospital / Institution:</span>
                <span className="font-bold text-manifest-900">{selectedOrderForReceipt.hospital}</span>
              </div>
              <div className="flex justify-between border-b border-manifest-100 pb-2">
                <span className="text-manifest-500">Authorized Contact:</span>
                <span className="font-medium">{selectedOrderForReceipt.contact} ({selectedOrderForReceipt.phone})</span>
              </div>
              <div className="flex justify-between border-b border-manifest-100 pb-2">
                <span className="text-manifest-500">Fulfillment Hub:</span>
                <span className="font-medium text-emerald-700">{selectedOrderForReceipt.dispatch}</span>
              </div>
              <div className="flex justify-between border-b border-manifest-100 pb-2">
                <span className="text-manifest-500">Timestamp:</span>
                <span className="font-medium">{selectedOrderForReceipt.date}</span>
              </div>
              <div className="flex justify-between border-b border-manifest-100 pb-2">
                <span className="text-manifest-500">Status:</span>
                <span className="font-bold text-emerald-700">{selectedOrderForReceipt.status} (Paid & Verified)</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-manifest-900 pt-2">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-800">{formatPrice(selectedOrderForReceipt.amount)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-manifest-100">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-manifest-900 hover:bg-manifest-800 text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-sm"
              >
                🖨️ Print / Save as PDF
              </button>
              <button
                onClick={() => setSelectedOrderForReceipt(null)}
                className="px-5 bg-manifest-100 hover:bg-manifest-200 text-manifest-800 font-semibold py-3 rounded-xl text-xs transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}