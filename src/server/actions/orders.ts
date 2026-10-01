"use server";

import { repository } from "@/lib/repository";
import { requireAdmin } from "@/lib/auth";
import type { ActionResult, OrderStatus } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(
  reference: string,
  status: OrderStatus
): Promise<ActionResult> {
  await requireAdmin();

  try {
    await repository.updateOrderStatus(reference, status);
    revalidatePath("/admin/orders");
    return { ok: true, data: undefined };
  } catch (error) {
    return { ok: false, error: `Failed to update order status: ${String(error)}` };
  }
}