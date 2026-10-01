$ErrorActionPreference = "Stop"

Write-Host "=== Starting PharmaSource Catalog Automation Agent ===" -ForegroundColor Cyan

# 1. Ensure AddToCartButton component exists
$addToCartPath = "src/components/site/AddToCartButton.tsx"
Write-Host "Writing client-side AddToCartButton component..." -ForegroundColor Yellow

$addToCartContent = @'
'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/Button';

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <Button
      onClick={() => addItem(product, 1)}
      className="w-full bg-manifest-800 text-sterile hover:bg-manifest-900 py-2.5 rounded-sheet text-xs font-semibold tracking-wide transition-colors"
    >
      Add to Basket
    </Button>
  );
}
'@

Set-Content -Path $addToCartPath -Value $addToCartContent -Encoding UTF8

# 2. Build verification test
Write-Host "Running Next.js build check..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "=== Catalog layout and cart integration successfully updated & verified! ===" -ForegroundColor Green
} else {
    Write-Error "Build failed. Review errors above."
    exit 1
}