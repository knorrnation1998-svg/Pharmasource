"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface OrderItem {
  id: string;
  name: string;
  priceXaf: number;
  quantity: number;
}

interface OrderDetails {
  reference: string;
  items: OrderItem[];
  totalAmount: number;
  dispatchHub: string;
  hospital: string;
  contact: string;
  date: string;
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    // Retrieve the latest order details saved during checkout
    const savedOrder = localStorage.getItem("keyani_last_order");
    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error("Failed to parse order details", e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-sterile py-12 px-6 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-manifest-100 p-8 sm:p-10 space-y-8">
        
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Keyani Supply Solutions</span>
          <h1 className="text-2xl font-bold text-manifest-900">Procurement Order Confirmed</h1>
          <p className="text-xs text-manifest-600">
            Your institutional payment has been securely verified. Your formulations have been logged for immediate medical dispatch.
          </p>
        </div>

        {/* Transaction Reference Box */}
        <div className="bg-manifest-50/70 border border-manifest-200 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] font-semibold uppercase text-manifest-500 tracking-wider">Transaction Reference</span>
          <div className="font-mono font-bold text-manifest-900 text-sm">
            {order ? order.reference : "KEYANI_479680"}
          </div>
        </div>

        {/* ORDER SUMMARY & MANIFEST DETAILS */}
        <div className="border border-manifest-200 rounded-2xl p-5 space-y-4 bg-white">
          <div className="border-b border-manifest-100 pb-3 flex justify-between items-center">
            <h3 className="font-bold text-manifest-900 text-xs uppercase tracking-wider">Manifest & Order Summary</h3>
            <span className="text-xs text-manifest-500 font-medium">{order?.date || "2026-10-01"}</span>
          </div>

          {/* Dispatch Destination */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex justify-between items-center text-xs">
            <span className="font-semibold text-emerald-900">Assigned Dispatch Hub:</span>
            <span className="font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
              {order ? order.dispatchHub : "Douala Central Hub"}
            </span>
          </div>

          {/* Items Table */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase text-manifest-500">Ordered Formulations / Items:</span>
            <div className="divide-y divide-manifest-100 border border-manifest-100 rounded-xl overflow-hidden">
              {order && order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center text-xs bg-manifest-50/30">
                    <div>
                      <div className="font-bold text-manifest-900">{item.name}</div>
                      <div className="text-[11px] text-manifest-500">Qty: {item.quantity} units</div>
                    </div>
                    <div className="font-bold text-manifest-900">
                      {(item.priceXaf * item.quantity).toLocaleString()} XAF
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-xs text-manifest-500 text-center">
                  Ceftriaxone 1g Injectable (Qty: 2) — 95,000 XAF
                </div>
              )}
            </div>
          </div>

          {/* Total Amount Incurred */}
          <div className="pt-2 border-t border-manifest-100 flex justify-between items-center text-sm font-bold text-manifest-900">
            <span>Total Amount Incurred:</span>
            <span className="text-emerald-700 text-base">
              {order ? order.totalAmount.toLocaleString() : "95,000"} XAF
            </span>
          </div>
        </div>

        {/* Next Steps & Release Protocol */}
        <div className="bg-manifest-50/50 border border-manifest-200 rounded-2xl p-5 space-y-2 text-xs text-manifest-700">
          <div className="font-bold text-manifest-900">Next Steps & Release Protocol:</div>
          <ul className="list-disc pl-4 space-y-1 text-manifest-600">
            <li>Our fulfillment desk in <strong className="text-manifest-800">{order?.dispatchHub || "Douala / Yaoundé"}</strong> has received your verified order manifest.</li>
            <li>Temperature-monitored cold-chain or express transport preparation is currently underway.</li>
            <li>An institutional invoice and waybill have been dispatched to your registered email address.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/catalog"
            className="flex-1 text-center bg-manifest-900 hover:bg-manifest-800 text-white font-semibold py-3.5 rounded-xl text-xs transition-all shadow-sm"
          >
            Return to Master Catalogue
          </Link>
          <button
            onClick={() => window.print()}
            className="flex-1 bg-manifest-100 hover:bg-manifest-200 text-manifest-800 font-semibold py-3.5 rounded-xl text-xs transition-all"
          >
            Print Procurement Receipt
          </button>
        </div>

      </div>
    </div>
  );
}