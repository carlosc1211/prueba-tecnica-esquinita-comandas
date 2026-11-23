export const PRODUCT_CATEGORIES = ["bocadillos", "tapas", "bebidas", "postres"] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  bocadillos: "Bocadillos",
  tapas: "Tapas",
  bebidas: "Bebidas",
  postres: "Postres",
};

export type MenuProduct = {
  id: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  priceCents: number;
};

export function groupByCategory<T extends { category: ProductCategory }>(
  items: readonly T[],
): { category: ProductCategory; items: T[] }[] {
  return PRODUCT_CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}

export const MENU_FILTERS = ["todas", ...PRODUCT_CATEGORIES] as const;

export type MenuFilter = (typeof MENU_FILTERS)[number];

export const MENU_FILTER_LABELS: Record<MenuFilter, string> = {
  todas: "Todas",
  ...PRODUCT_CATEGORY_LABELS,
};

export function isMenuFilter(value: unknown): value is MenuFilter {
  return typeof value === "string" && (MENU_FILTERS as readonly string[]).includes(value);
}

export function filterGroupsByCategory<G extends { category: ProductCategory }>(
  groups: readonly G[],
  filter: MenuFilter,
): G[] {
  if (filter === "todas") return [...groups];
  return groups.filter((group) => group.category === filter);
}
