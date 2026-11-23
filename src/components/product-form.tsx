"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProduct } from "@/lib/actions/products";
import { PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS } from "@/lib/domain/products";
import { initialActionState } from "@/lib/validation/form";
import { FieldError, FormMessage, inputClass, labelClass, SubmitButton } from "./forms";

export function ProductForm() {
  const [state, formAction] = useActionState(createProduct, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = state.fieldErrors;

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3" noValidate>
      <FormMessage state={state} />
      <div>
        <label htmlFor="name" className={labelClass}>
          Nombre
        </label>
        <input
          id="name"
          name="name"
          required
          aria-invalid={Boolean(errors.name)}
          aria-describedby="name-error"
          className={inputClass}
        />
        <FieldError id="name-error" message={errors.name} />
      </div>
      <div>
        <label htmlFor="description" className={labelClass}>
          Descripción
        </label>
        <input
          id="description"
          name="description"
          maxLength={240}
          aria-invalid={Boolean(errors.description)}
          aria-describedby="description-error"
          className={inputClass}
        />
        <FieldError id="description-error" message={errors.description} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="category" className={labelClass}>
            Categoría
          </label>
          <select
            id="category"
            name="category"
            defaultValue="bocadillos"
            aria-invalid={Boolean(errors.category)}
            aria-describedby="category-error"
            className={inputClass}
          >
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {PRODUCT_CATEGORY_LABELS[category]}
              </option>
            ))}
          </select>
          <FieldError id="category-error" message={errors.category} />
        </div>
        <div>
          <label htmlFor="price" className={labelClass}>
            Precio (€)
          </label>
          <input
            id="price"
            name="price"
            inputMode="decimal"
            placeholder="6,50"
            required
            aria-invalid={Boolean(errors.price)}
            aria-describedby="price-error"
            className={inputClass}
          />
          <FieldError id="price-error" message={errors.price} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="available"
          name="available"
          type="checkbox"
          defaultChecked
          className="h-4 w-4 rounded border-stone-300 accent-brand-600"
        />
        <label htmlFor="available" className="text-sm text-stone-700">
          Disponible en la carta
        </label>
      </div>
      <SubmitButton pendingLabel="Guardando…">Añadir producto</SubmitButton>
    </form>
  );
}
