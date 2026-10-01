"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { formatXaf } from "@/lib/utils";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [dispatchMethod, setDispatchMethod] = useState("douala-hub");
  const [formData, setFormData] = useState({
    hospitalName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  });

  // Safely compute subtotal with fallback checks
  const subtotal = Array.isArray(items)
    ? items.reduce((acc, item) => {
        const price = item?.product?.priceXaf || item?.priceXaf || 0;
        const qty = item?.quantity || 1;
        return acc + price * qty;
      }, 0)
    : 0;
  
  const dispatchFees: Record<string, number> = {
    "douala-hub": 0,
    "yaounde-express": 15000,
    "cold-chain-regional": 35000,
  };

  const shippingCost = dispatchFees[dispatchMethod] || 0;
  const totalAmountXaf = subtotal + shippingCost;

  // Visible conversion for the user: XAF to USD (approx. 600 XAF per 1 USD)
  const usdConversionRate = 600;
  const totalAmountUsd = (totalAmountXaf / usdConversionRate).toFixed(2);

  const handlePaystackCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!items || items.length === 0) {
      alert("Your order basket is empty.");
      return;
    }

    const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_live_your_actual_paystack_key_here";
    
    if (typeof window !== "undefined" && (window as any).PaystackPop) {
      // Background conversion: XAF converted to NGN for Paystack gateway compatibility (approx. 1 XAF = 2.5 NGN)
      const conversionRateToNgn = 2.5; 
      const amountInNgnKobo = Math.round(totalAmountXaf * conversionRateToNgn * 100);

      const handler = (window as any).PaystackPop.setup({
        key: paystackPublicKey,
        email: formData.email,
        amount: amountInNgnKobo, // Processed in NGN kobo behind the scenes
        currency: "NGN",
        ref: "KEYANI_" + Math.floor((Math.random() * 1000000) + 1),
        metadata: {
          hospital: formData.hospitalName,
          contact: formData.contactPerson,
          phone: formData.phone,
          dispatch: dispatchMethod,
          originalAmountXaf: totalAmountXaf,
          equivalentUsd: totalAmountUsd,
          itemsCount: items.length,
        },
        callback: function (response: { reference: string }) {
          clearCart();
          window.location.href = `/checkout/success?ref=${response.reference}`;
        },
        onClose: function () {
          alert("Payment window closed.");
        },
      });
      handler.openIframe();
    } else {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => {
        handlePaystackCheckout(e);
      };
      document.body.appendChild(script);
    }
  };

  return (
    <div className="min-h-screen bg-sterile py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Keyani Supply Solutions</span>
          <h1 className="text-3xl font-bold text-manifest-900 mt-1">Institutional Checkout & Dispatch</h1>
          <p className="text-sm text-manifest-600 mt-1">Complete your hospital procurement details and secure payment via Paystack.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Checkout Form */}
          <form onSubmit={handlePaystackCheckout} className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-manifest-100 space-y-5">
              <h2 className="text-lg font-bold text-manifest-900 border-b border-manifest-100 pb-3">1. Hospital & Institution Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-manifest-700 uppercase mb-2">Hospital / Clinic Name</label>
                  <input
                    type="text"
                    required
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                    placeholder="e.g. Hôpital Général de Douala"
                    className="w-full px-4 py-3 rounded-xl border border-manifest-200 text-sm focus:outline-none focus:ring-2 focus:ring-manifest-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-manifest-700 uppercase mb-2">Procurement Officer / Contact</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Dr. / Mr. Name"
                    className="w-full px-4 py-3 rounded-xl border border-manifest-200 text-sm focus:outline-none focus:ring-2 focus:ring-manifest-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-manifest-700 uppercase mb-2">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="procurement@hospital.cm"
                    className="w-full px-4 py-3 rounded-xl border border-manifest-200 text-sm focus:outline-none focus:ring-2 focus:ring-manifest-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-manifest-700 uppercase mb-2">WhatsApp / Direct Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+237 6..."
                    className="w-full px-4 py-3 rounded-xl border border-manifest-200 text-sm focus:outline-none focus:ring-2 focus:ring-manifest-900"
                  />
                </div>
              </div>
            </div>

            {/* Dispatch Options */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-manifest-100 space-y-4">
              <h2 className="text-lg font-bold text-manifest-900 border-b border-manifest-100 pb-3">2. Select Dispatch Option</h2>
              
              <div className="space-y-3">
                <label className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${dispatchMethod === 'douala-hub' ? 'border-manifest-900 bg-manifest-50/50' : 'border-manifest-200'}`}>
                  <input
                    type="radio"
                    name="dispatch"
                    value="douala-hub"
                    checked={dispatchMethod === 'douala-hub'}
                    onChange={(e) => setDispatchMethod(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <span className="block font-semibold text-manifest-900 text-sm">Douala Akwa Hub Pickup (Free)</span>
                    <span className="text-xs text-manifest-500">Immediate inventory release at our central Akwa medical warehouse.</span>
                  </div>
                </label>

                <label className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${dispatchMethod === 'yaounde-express' ? 'border-manifest-900 bg-manifest-50/50' : 'border-manifest-200'}`}>
                  <input
                    type="radio"
                    name="dispatch"
                    value="yaounde-express"
                    checked={dispatchMethod === 'yaounde-express'}
                    onChange={(e) => setDispatchMethod(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <span className="block font-semibold text-manifest-900 text-sm">Yaoundé Bastos Clinical Express Dispatch</span>
                      <span className="text-xs text-manifest-500">Secured transport directly to Yaoundé hospital corridors.</span>
                    </div>
                    <span className="font-bold text-xs text-manifest-900">+15,000 XAF</span>
                  </div>
                </label>

                <label className={`flex items-start p-4 rounded-xl border cursor-pointer transition-all ${dispatchMethod === 'cold-chain-regional' ? 'border-manifest-900 bg-manifest-50/50' : 'border-manifest-200'}`}>
                  <input
                    type="radio"
                    name="dispatch"
                    value="cold-chain-regional"
                    checked={dispatchMethod === 'cold-chain-regional'}
                    onChange={(e) => setDispatchMethod(e.target.value)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <span className="block font-semibold text-manifest-900 text-sm">Temperature-Validated Regional Cold-Chain Transport</span>
                      <span className="text-xs text-manifest-500">Required for biologics and vaccines (2°C &ndash; 8°C monitored).</span>
                    </div>
                    <span className="font-bold text-xs text-manifest-900">+35,000 XAF</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-4 rounded-xl shadow-lg transition-all text-sm tracking-wide flex flex-col items-center justify-center gap-0.5"
            >
              <span>Proceed to Paystack Secure Payment</span>
              <span className="text-xs font-normal opacity-90">({formatXaf(totalAmountXaf)} &approx; ${totalAmountUsd} USD)</span>
            </button>
          </form>

          {/* Order Summary Sidebar */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-manifest-100 h-fit space-y-6">
            <h2 className="text-lg font-bold text-manifest-900 border-b border-manifest-100 pb-3">Order Summary</h2>

            <div className="space-y-4 max-h-72 overflow-y-auto divide-y divide-manifest-100">
              {!items || items.length === 0 ? (
                <p className="text-xs text-manifest-500 py-4 text-center">Your basket is currently empty.</p>
              ) : (
                items.map((item, index) => {
                  const product = item?.product || item;
                  const productName = product?.name || "Hospital Formulation";
                  const unitPrice = product?.priceXaf || 0;
                  const qty = item?.quantity || 1;

                  return (
                    <div key={index} className="pt-3 flex justify-between text-xs">
                      <div>
                        <p className="font-semibold text-manifest-900">{productName}</p>
                        <p className="text-manifest-500">Qty: {qty} &times; {formatXaf(unitPrice)}</p>
                      </div>
                      <p className="font-bold text-manifest-900">{formatXaf(unitPrice * qty)}</p>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-4 border-t border-manifest-100 space-y-2 text-xs">
              <div className="flex justify-between text-manifest-600">
                <span>Formulations Subtotal</span>
                <span>{formatXaf(subtotal)}</span>
              </div>
              <div className="flex justify-between text-manifest-600">
                <span>Dispatch & Cold-Chain Fee</span>
                <span>{formatXaf(shippingCost)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-manifest-900 pt-3 border-t border-manifest-200 items-baseline">
                <span>Total Due</span>
                <div className="text-right">
                  <span className="block">{formatXaf(totalAmountXaf)}</span>
                  <span className="text-[11px] font-normal text-manifest-500">Est. ${totalAmountUsd} USD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}