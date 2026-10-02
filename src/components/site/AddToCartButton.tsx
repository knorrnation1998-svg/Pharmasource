'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/Button';

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <Button
  onClick={() => addItem(product as any)}
  className="w-full bg-manifest-800 text-sterile hover:bg-manifest-900 py-2.5 rounded-sheet text-xs font-semibold tracking-wide transition-colors"
>
  Add to Basket
</Button>
  );
}
