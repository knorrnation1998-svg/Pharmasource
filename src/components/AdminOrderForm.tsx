'use client';

import React, { useState } from 'react';

export default function AdminOrderForm() {
  const [customerName, setCustomerName] = useState('Dr Esther Agbama');
  const [hospitalName, setThemeHospital] = useState('Ayo Memorial Clinic, Lagos, Nigeria');
  const [itemName, setItemName] = useState('C Neuro');
  const [quantity, setQuantity] = useState(5);
  const [totalXaf, setTotalXaf] = useState(50000);
  const [customDate, setCustomDate] = useState('2026-09-15T10:00'); // Default to your backdated target!
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        customerName,
        hospitalName,
        totalXaf: Number(totalXaf),
        items: [{ name: itemName, quantity: Number(quantity), priceXaf: Number(totalXaf) / Number(quantity) }],
        createdAt: new Date(customDate).toISOString(), // Passes the backdated timestamp!
        paymentRef: 'PAYSTACK_CARD_MANUAL_BACKDATE',
        status: 'completed'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save order record.');

      setMessage('✅ Backdated record successfully saved to Turso cloud database!');
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md border border-gray-100 my-8">
      <h2 className="text-xl font-bold text-gray-800 mb-2">Admin: Log / Backdate Sales Record</h2>
      <p className="text-sm text-gray-500 mb-6">
        Insert past orders manually with custom transaction dates into your permanent Turso cloud storage.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer / Physician Name</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hospital / Facility & Address</label>
          <input
            type="text"
            value={hospitalName}
            onChange={(e) => setThemeHospital(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item / Product Name</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (Packs)</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (XAF)</label>
          <input
            type="number"
            value={totalXaf}
            onChange={(e) => setTotalXaf(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Date & Time (Backdate)</label>
          <input
            type="datetime-local"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Select the exact historical date and time for this entry.</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Saving to Cloud...' : 'Save Backdated Order'}
        </button>

        {message && (
          <p className={`text-sm text-center font-medium mt-3 ${message.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}