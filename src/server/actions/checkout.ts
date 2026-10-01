'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { startCheckoutAction } from '@/server/actions/checkout';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, subtotalXaf, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    facility: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError('Your basket is empty.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const checkoutInput = {
        customer: formData,
        items: items.map((item) => ({
          productId: item.id,
          qty: item.quantity,
        })),
      };

      const result = await startCheckoutAction(checkoutInput);

      if (!result.ok) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Clear the cart on successful session creation before redirecting
      clearCart();

      // Redirect user to payment provider (Flutterwave gateway)
      window.location.href = result.data.redirectUrl;
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An unexpected error occurred during checkout initialization.');
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-sterile flex flex-col items-center justify-center p-6 text-center">
        <h1 className="font-display text-2xl text-manifest-900 mb-2">Your Basket is Empty</h1>
        <p className="text-manifest-600 mb-6">Add specialized pharmaceutical items from the catalog before checking out.</p>
        <Link href="/catalog">
          <Button className="bg-manifest-800 text-sterile px-6 py-2 rounded-sheet">Return to Catalogue</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Customer & Facility Form */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
          <h1 className="font-display text-xl font-semibold text-slate-900 mb-6">Clinical Checkout</h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Full Name / Attending Clinician
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Dr. Jean Dupont"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Professional Email
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="j.dupont@hospital.cm"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Mobile Number (MTN / Orange Money)
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="+237 6XXXXXXXX"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Medical Facility / Hospital Name
              </label>
              <input
                type="text"
                name="facility"
                required
                value={formData.facility}
                onChange={handleChange}
                placeholder="Hopital General de Douala"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? 'Initializing Secure Gateway...' : `Proceed to Payment (${subtotalXaf.toLocaleString()} XAF)`}
            </Button>
          </form>
        </div>

        {/* Order Summary Sidebar */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-fit">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100">Order Summary</h2>
          
          <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">Qty: {item.quantity} × {item.priceXaf.toLocaleString()} XAF</p>
                </div>
                <span className="font-semibold text-slate-900">{(item.priceXaf * item.quantity).toLocaleString()} XAF</span>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span>{subtotalXaf.toLocaleString()} XAF</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Customs & Logistics Clearance</span>
              <span className="text-emerald-600 font-medium">Included (Douala Hub)</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-3 border-t border-slate-200">
              <span>Total Payable</span>
              <span>{subtotalXaf.toLocaleString()} XAF</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}