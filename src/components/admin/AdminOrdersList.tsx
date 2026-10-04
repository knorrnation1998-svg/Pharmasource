'use client';

import React, { useEffect, useState } from 'react';

export default function AdminOrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .catch((err) => console.error('Failed to load orders', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-gray-500 py-4">Loading logged orders...</div>;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 my-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Logged Orders & Backdated Transactions</h3>
      {orders.length === 0 ? (
        <p className="text-sm text-gray-500">No orders logged yet.</p>
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
                  <td className="p-3 font-semibold text-blue-600">{order.totalXaf.toLocaleString()} XAF</td>
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
  );
}