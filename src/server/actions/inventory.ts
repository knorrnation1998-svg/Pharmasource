"use server";

import { revalidatePath } from "next/cache";
import { repository } from "@/lib/repository";
import { requireAdmin } from "@/lib/auth";
import {
  priceAdjustmentSchema,
  productSchema,
  stockAdjustmentSchema,
} from "@/lib/validation";
import type { ActionResult, Product } from "@/lib/types";

function flatten(error: { flatten(): { fieldErrors: Record<string, unknown> } }) {
  const { fieldErrors } = error.flatten();
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([k, v]) => [k, (v as string[]) ?? []])
  );
}

function revalidateAll() {
  revalidatePath("/admin");
  revalidatePath("/catalog");
  revalidatePath("/");
}

export async function createProductAction(
  _prev: ActionResult<Product> | null,
  formData: FormData
): Promise<ActionResult<Product>> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    ...Object.fromEntries(formData),
    requiresPrescription: formData.get("requiresPrescription") === "on",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: flatten(parsed.error),
    };
  }

  try {
    const product = await repository.createProduct(parsed.data);
    revalidateAll();
    return { ok: true, data: product };
  } catch (cause) {
    return { ok: false, error: `Could not save the product. ${String(cause)}` };
  }
}

export async function updateProductAction(
  id: string,
  patch: Partial<Product>
): Promise<ActionResult<Product>> {
  await requireAdmin();
  try {
    const product = await repository.updateProduct(id, patch);
    revalidateAll();
    return { ok: true, data: product };
  } catch (cause) {
    return { ok: false, error: `Could not update the product. ${String(cause)}` };
  }
}

/** Relative stock change — used by the +/- controls in the admin table. */
export async function adjustStockAction(
  productId: string,
  delta: number
): Promise<ActionResult<Product>> {
  await requireAdmin();

  const parsed = stockAdjustmentSchema.safeParse({ productId, delta });
  if (!parsed.success) return { ok: false, error: "Invalid stock adjustment." };

  try {
    const product = await repository.adjustStock(
      parsed.data.productId,
      parsed.data.delta
    );
    revalidateAll();
    return { ok: true, data: product };
  } catch (cause) {
    return { ok: false, error: `Could not adjust stock. ${String(cause)}` };
  }
}

export async function setPriceAction(
  productId: string,
  priceXaf: number
): Promise<ActionResult<Product>> {
  await requireAdmin();

  const parsed = priceAdjustmentSchema.safeParse({ productId, priceXaf });
  if (!parsed.success) {
    return { ok: false, error: "Price must be a positive whole number of XAF." };
  }

  try {
    const product = await repository.updateProduct(parsed.data.productId, {
      priceXaf: parsed.data.priceXaf,
    });
    revalidateAll();
    return { ok: true, data: product };
  } catch (cause) {
    return { ok: false, error: `Could not update the price. ${String(cause)}` };
  }
}

export async function deleteProductAction(
  productId: string
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await repository.deleteProduct(productId);
    revalidateAll();
    return { ok: true, data: undefined };
  } catch (cause) {
    return { ok: false, error: `Could not remove the product. ${String(cause)}` };
  }
}
