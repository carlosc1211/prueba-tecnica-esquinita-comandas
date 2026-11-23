"use server";

import { refresh, updateTag } from "next/cache";
import { requireUser } from "../auth";
import { PRODUCTS_TAG } from "../data/menu";
import { createSupabaseServerClient } from "../supabase/server";
import {
  productAvailabilitySchema,
  productIdSchema,
  productSchema,
} from "../validation/schemas";
import {
  failure,
  formDataToObject,
  invalid,
  success,
  type ActionState,
} from "../validation/form";

const FOREIGN_KEY_VIOLATION = "23503";

export async function createProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = productSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return invalid(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").insert({
    name: parsed.data.name,
    description: parsed.data.description,
    category: parsed.data.category,
    price_cents: parsed.data.price,
    available: parsed.data.available,
  });

  if (error) {
    console.error("createProduct", error);
    return failure("No se pudo crear el producto");
  }

  updateTag(PRODUCTS_TAG);
  refresh();
  return success(`«${parsed.data.name}» añadido a la carta`);
}

export async function setProductAvailability(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = productAvailabilitySchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return invalid(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("products")
    .update({ available: parsed.data.available })
    .eq("id", parsed.data.id);

  if (error) {
    console.error("setProductAvailability", error);
    return failure("No se pudo actualizar el producto");
  }

  updateTag(PRODUCTS_TAG);
  refresh();
  return success(parsed.data.available ? "Producto disponible" : "Producto retirado");
}

export async function deleteProduct(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = productIdSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return invalid(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("products").delete().eq("id", parsed.data.id);

  if (error) {
    if (error.code === FOREIGN_KEY_VIOLATION) {
      return failure("Tiene comandas asociadas: retíralo de la carta en lugar de borrarlo");
    }
    console.error("deleteProduct", error);
    return failure("No se pudo borrar el producto");
  }

  updateTag(PRODUCTS_TAG);
  refresh();
  return success("Producto eliminado");
}
