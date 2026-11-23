import type { Metadata } from "next";
import { Suspense } from "react";
import { ActionButton } from "@/components/action-button";
import { ProductForm } from "@/components/product-form";
import { deleteProduct, setProductAvailability } from "@/lib/actions/products";
import { listStaffProducts } from "@/lib/data/staff";
import { formatEuros } from "@/lib/domain/money";
import { groupByCategory, PRODUCT_CATEGORY_LABELS } from "@/lib/domain/products";

export const metadata: Metadata = { title: "Carta" };

async function ProductList() {
  const products = await listStaffProducts();
  const groups = groupByCategory(products);

  if (groups.length === 0) {
    return <p className="text-sm text-stone-500">Aún no hay productos.</p>;
  }

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <section key={group.category} aria-labelledby={`staff-cat-${group.category}`}>
          <h3
            id={`staff-cat-${group.category}`}
            className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500"
          >
            {PRODUCT_CATEGORY_LABELS[group.category]}
          </h3>
          <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
            {group.items.map((product) => (
              <li
                key={product.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
              >
                <div className="min-w-0">
                  <p className={`font-medium ${product.available ? "" : "text-stone-400 line-through"}`}>
                    {product.name}
                  </p>
                  <p className="text-xs text-stone-500">{formatEuros(product.priceCents)}</p>
                </div>
                <div className="flex gap-1">
                  <ActionButton
                    action={setProductAvailability}
                    fields={{ id: product.id, available: String(!product.available) }}
                    label={product.available ? "Retirar" : "Activar"}
                  />
                  <ActionButton
                    action={deleteProduct}
                    fields={{ id: product.id }}
                    label="Borrar"
                    variant="danger"
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export default function MenuAdminPage() {
  return (
    <main className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <section aria-labelledby="new-product" className="rounded-xl border border-stone-200 bg-white p-4">
        <h1 id="new-product" className="mb-3 font-semibold">
          Nuevo producto
        </h1>
        <ProductForm />
      </section>
      <section aria-label="Productos">
        <Suspense fallback={<p className="text-sm text-stone-500">Cargando carta…</p>}>
          <ProductList />
        </Suspense>
      </section>
    </main>
  );
}
