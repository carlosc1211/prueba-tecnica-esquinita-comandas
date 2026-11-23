"use server";

import { refresh } from "next/cache";
import { requireUser } from "../auth";
import { canTransitionOrder, mergeOrderLines, type OrderStatus } from "../domain/orders";
import { createSupabaseServerClient } from "../supabase/server";
import { orderSchema, orderStatusSchema } from "../validation/schemas";
import {
  failure,
  formDataToObject,
  invalid,
  success,
  type ActionState,
} from "../validation/form";

export async function createOrder(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();
  const parsed = orderSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return invalid(parsed.error);
  }

  const lines = mergeOrderLines(parsed.data.items);
  if (lines.some((line) => line.quantity > 99)) {
    return failure("Cantidad máxima 99 por producto");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("create_order", {
    p_table_number: parsed.data.tableNumber,
    p_notes: parsed.data.notes ?? "",
    p_items: lines.map((line) => ({ product_id: line.productId, quantity: line.quantity })),
  });

  if (error) {
    if (error.message.includes("unavailable_product")) {
      return failure("Algún producto ya no está disponible. Recarga la carta.");
    }
    console.error("createOrder", error);
    return failure("No se pudo crear la comanda");
  }

  refresh();
  return success(`Comanda de la mesa ${parsed.data.tableNumber} enviada`);
}

export async function updateOrderStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = orderStatusSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return invalid(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { data: current, error: readError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", parsed.data.id)
    .maybeSingle<{ status: OrderStatus }>();

  if (readError) {
    console.error("updateOrderStatus.read", readError);
    return failure("No se pudo actualizar la comanda");
  }
  if (!current) {
    return failure("La comanda no existe");
  }
  if (!canTransitionOrder(current.status, parsed.data.status)) {
    return failure("Cambio de estado no permitido");
  }

  const { data: updated, error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .eq("status", current.status)
    .select("id");

  if (error) {
    console.error("updateOrderStatus", error);
    return failure("No se pudo actualizar la comanda");
  }
  if (updated.length === 0) {
    return failure("Otra persona ha cambiado esta comanda. Recarga.");
  }

  refresh();
  return success("Estado actualizado");
}
