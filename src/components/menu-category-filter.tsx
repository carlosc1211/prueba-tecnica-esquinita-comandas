"use client";

import { useState } from "react";
import { formatEuros } from "@/lib/domain/money";
import {
  filterGroupsByCategory,
  MENU_FILTER_LABELS,
  MENU_FILTERS,
  PRODUCT_CATEGORY_LABELS,
  type MenuFilter,
  type MenuProduct,
  type ProductCategory,
} from "@/lib/domain/products";

type MenuGroup = { category: ProductCategory; items: MenuProduct[] };

export function MenuCategoryFilter({ groups }: { groups: MenuGroup[] }) {
  const [filter, setFilter] = useState<MenuFilter>("todas");
  const visibleGroups = filterGroupsByCategory(groups, filter);

  return (
    <>
      <div
        role="group"
        aria-label="Filtrar la carta por categoría"
        className="mb-6 flex flex-wrap gap-2"
      >
        {MENU_FILTERS.map((option) => {
          const active = option === filter;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(option)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                active
                  ? "border-brand-600 bg-brand-600 text-white hover:bg-brand-700"
                  : "border-stone-300 bg-white text-stone-700 hover:border-brand-500 hover:bg-brand-50"
              }`}
            >
              {MENU_FILTER_LABELS[option]}
            </button>
          );
        })}
      </div>

      {visibleGroups.length === 0 ? (
        <p role="status" className="text-stone-600">
          No hay productos disponibles en esta categoría.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {visibleGroups.map((group) => (
            <section
              key={group.category}
              aria-labelledby={`cat-${group.category}`}
              className="rounded-xl border border-stone-200 bg-white p-5"
            >
              <h3
                id={`cat-${group.category}`}
                className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-600"
              >
                {PRODUCT_CATEGORY_LABELS[group.category]}
              </h3>
              <ul className="space-y-3">
                {group.items.map((product) => (
                  <li key={product.id} className="flex justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium">{product.name}</p>
                      {product.description ? (
                        <p className="text-sm text-stone-600">{product.description}</p>
                      ) : null}
                    </div>
                    <p className="shrink-0 font-semibold tabular-nums">
                      {formatEuros(product.priceCents)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
