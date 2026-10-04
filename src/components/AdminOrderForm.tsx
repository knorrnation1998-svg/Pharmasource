'use client';

import React, { useState } from 'react';

export default function AdminOrderForm() {
  const [customerName, setCustomerName] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [itemName, setItemName] = useState('C Neuro');
  const [quantity, setQuantity] = useState('1');
  const [priceXaf, setPriceXaf] = useState('10000');
  
  // Default to a September date or current date
  const [customDate, setCustomDate] = useState('2026-09-15T10:00');
  
  const [submitting, setSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccessOrder(null);

    try {
      const totalXaf = Number(quantity) * Number(priceXaf);
      const payload = {
        reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName,
        hospitalName,
        status: 'completed',
        totalXaf,
        createdAt: new Date(customDate).toISOString(),
        items: JSON.stringify([{ name: itemName, quantity: Number(quantity), priceXaf: Number(priceXaf) }]),
        paymentRef: 'MANUAL_BACKDATE'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');

      setSuccessOrder(payload);
      // Reset form fields
      setCustomerName('');
      setHospitalName('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 print:shadow-none print:border-none">
      <h3 className="text-lg font-bold text-gray-800 mb-4 print:hidden">Create & Backdate Order</h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200 print:hidden">
          {error}
        </div>
      )}

      {successOrder && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg print:border-black print:bg-white">
          <div className="flex justify-between items-center mb-2 print:hidden">
            <span className="text-green-800 font-semibold text-sm">Order successfully logged!</span>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
            >
              🖨️ Print Receipt
            </button>
          </div>

          {/* Receipt Printable View */}
          <div className="p-4 bg-white border border-gray-200 rounded space-y-3 text-gray-800 print:border-none print:p-0">
            <div className="text-center border-b pb-3">
              <h2 className="font-bold text-xl">Keyani Supply Solutions</h2>
              <p className="text-xs text-gray-500">Official Sales Receipt</p>
            </div>
            <div className="text-sm space-y-1">
              <p><strong>Reference:</strong> {successOrder.reference}</p>
              <p><strong>Date:</strong> {new Date(successOrder.createdAt).toLocaleString()}</p>
              <p><strong>Customer:</strong> {successOrder.customerName}</p>
              <p><strong>Hospital/Clinic:</strong> {successOrder.hospitalName}</p>
            </div>
            <div className="border-t border-b py-2 my-2 text-sm">
              <div className="flex justify-between font-semibold text-gray-600 mb-1">
                <span>Item</span>
                <span>Qty x Price</span>
              </div>
              <div className="flex justify-between">
                <span>{itemName}</span>
                <span>{quantity} × {Number(priceXaf).toLocaleString()} XAF</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total:</span>
              <span className="text-blue-600">{successOrder.totalXaf.toLocaleString()} XAF</span>
            </div>
            <div className="text-center text-xs text-gray-400 pt-4 border-t mt-4">
              Thank you for your business!
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Dr Esther Agbama"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hospital / Clinic</label>
            <input
              type="text"
              required
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="e.g. Ayo Memorial Clinic"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Item Name</label>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Price per unit (XAF)</label>
            <input
              type="number"
              min="0"
              required
              value={priceXaf}
              onChange={(e) => setPriceXaf(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Backdate Order Date & Time</label>
          <input
            type="datetime-local"
            required
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 px-4 bg-manifest-900 text-white font-medium rounded-md hover:bg-black transition text-sm disabled:opacity-50"
        >
          {submitting ? 'Saving Order...' : 'Log Order & Generate Receipt'}
        </button>
      </form>
    </div>
  );
}