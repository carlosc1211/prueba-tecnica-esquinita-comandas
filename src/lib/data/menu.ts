import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { MenuProduct, ProductCategory } from "../domain/products";
import { createSupabasePublicClient } from "../supabase/public";

export const PRODUCTS_TAG = "products";

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  price_cents: number;
};

export async function getPublicMenu(): Promise<MenuProduct[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG);
  cacheLife("hours");

  const supabase = createSupabasePublicClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, category, price_cents")
    .eq("available", true)
    .order("category")
    .order("name")
    .returns<ProductRow[]>();

  if (error) {
    console.error("getPublicMenu", error);
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    priceCents: row.price_cents,
  }));
}
