"use client";

import { useActionState, useMemo, useState } from "react";
import { createOrder } from "@/lib/actions/orders";
import { formatEuros } from "@/lib/domain/money";
import { calculateTotalCents } from "@/lib/domain/orders";
import {
  groupByCategory,
  PRODUCT_CATEGORY_LABELS,
  type MenuProduct,
} from "@/lib/domain/products";
import { initialActionState, type ActionState } from "@/lib/validation/form";
import { FieldError, FormMessage, inputClass, labelClass, SubmitButton } from "./forms";

export function OrderForm({ products }: { products: MenuProduct[] }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [tableNumber, setTableNumber] = useState("");
  const [notes, setNotes] = useState("");

  const [state, formAction] = useActionState(
    async (prev: ActionState, formData: FormData) => {
      const result = await createOrder(prev, formData);
      if (result.ok) {
        setQuantities({});
        setTableNumber("");
        setNotes("");
      }
      return result;
    },
    initialActionState,
  );

  const groups = useMemo(() => groupByCategory(products), [products]);

  const selected = products
    .filter((product) => (quantities[product.id] ?? 0) > 0)
    .map((product) => ({ product, quantity: quantities[product.id] }));

  const totalCents = calculateTotalCents(
    selected.map(({ product, quantity }) => ({ quantity, unitPriceCents: product.priceCents })),
  );

  const itemsJson = JSON.stringify(
    selected.map(({ product, quantity }) => ({ productId: product.id, quantity })),
  );

  const change = (productId: string, delta: number) => {
    setQuantities((current) => {
      const next = Math.min(99, Math.max(0, (current[productId] ?? 0) + delta));
      return { ...current, [productId]: next };
    });
  };

  if (products.length === 0) {
    return <p className="text-sm text-stone-600">No hay productos disponibles en la carta.</p>;
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <input type="hidden" name="items" value={itemsJson} />
      <div className="grid grid-cols-[6rem_1fr] gap-3">
        <div>
          <label htmlFor="tableNumber" className={labelClass}>
            Mesa
          </label>
          <input
            id="tableNumber"
            name="tableNumber"
            type="number"
            min={1}
            max={50}
            value={tableNumber}
            onChange={(event) => setTableNumber(event.target.value)}
            required
            aria-invalid={Boolean(state.fieldErrors.tableNumber)}
            aria-describedby="tableNumber-error"
            className={inputClass}
          />
          <FieldError id="tableNumber-error" message={state.fieldErrors.tableNumber} />
        </div>
        <div>
          <label htmlFor="notes" className={labelClass}>
            Notas
          </label>
          <input
            id="notes"
            name="notes"
            maxLength={300}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Sin cebolla, alergias…"
            aria-invalid={Boolean(state.fieldErrors.notes)}
            aria-describedby="notes-error"
            className={inputClass}
          />
          <FieldError id="notes-error" message={state.fieldErrors.notes} />
        </div>
      </div>

      <div className="max-h-80 space-y-3 overflow-y-auto rounded-md border border-stone-200 p-3">
        {groups.map((group) => (
          <fieldset key={group.category}>
            <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-stone-500">
              {PRODUCT_CATEGORY_LABELS[group.category]}
            </legend>
            <ul className="divide-y divide-stone-100">
              {group.items.map((product) => {
                const quantity = quantities[product.id] ?? 0;
                return (
                  <li key={product.id} className="flex items-center justify-between gap-2 py-1.5">
                    <span className="min-w-0 text-sm">
                      <span className="block truncate">{product.name}</span>
                      <span className="text-xs text-stone-500">
                        {formatEuros(product.priceCents)}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => change(product.id, -1)}
                        disabled={quantity === 0}
                        aria-label={`Quitar ${product.name}`}
                        className="h-7 w-7 rounded border border-stone-300 text-sm disabled:opacity-40"
                      >
                        −
                      </button>
                      <output
                        aria-live="polite"
                        aria-label={`Cantidad de ${product.name}`}
                        className="w-6 text-center text-sm tabular-nums"
                      >
                        {quantity}
                      </output>
                      <button
                        type="button"
                        onClick={() => change(product.id, 1)}
                        aria-label={`Añadir ${product.name}`}
                        className="h-7 w-7 rounded border border-stone-300 text-sm"
                      >
                        +
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          </fieldset>
        ))}
      </div>
      <FieldError id="items-error" message={state.fieldErrors.items} />

      <div className="flex items-center justify-between">
        <p className="text-sm">
          Total: <strong className="tabular-nums">{formatEuros(totalCents)}</strong>
        </p>
        <SubmitButton pendingLabel="Enviando…">Enviar comanda</SubmitButton>
      </div>
    </form>
  );
}
