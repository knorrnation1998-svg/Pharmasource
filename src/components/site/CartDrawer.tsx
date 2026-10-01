'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartDrawer({ isOpen, onClose, onCheckout }: CartDrawerProps) {
  const { items, updateQuantity, removeItem, subtotalXaf, totalItems, hasPrescriptionItems } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-900">Clinical Basket ({totalItems})</h2>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg"
            >
              ✕
            </button>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <p>Your basket is currently empty.</p>
                <p className="text-sm mt-1">Select specialized products from the catalog to begin.</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-900">{item.name}</h3>
                    <p className="text-xs text-slate-500">{item.unit}</p>
                    {item.requiresPrescription && (
                      <span className="inline-block mt-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-200">
                        Prescription Required
                      </span>
                    )}
                    <div className="mt-2 text-sm font-semibold text-slate-900">
                      {item.priceXaf.toLocaleString()} XAF
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Remove
                    </button>
                    <div className="flex items-center gap-2 border border-slate-200 rounded px-2 py-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="text-slate-600 hover:text-black font-bold px-1"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-slate-600 hover:text-black font-bold px-1"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-4">
              {hasPrescriptionItems && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                  ℹ️ Some items in your basket require medical credentials or MINSANTE authorization verification during checkout.
                </div>
              )}

              <div className="flex justify-between items-center text-base font-medium text-slate-900">
                <span>Subtotal</span>
                <span className="text-xl font-bold">{subtotalXaf.toLocaleString()} XAF</span>
              </div>

              <Button 
                onClick={onCheckout}
                className="w-full py-3 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
              >
                Proceed to Secure Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}