"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import type { ActionState } from "@/lib/validation/form";

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "border border-stone-300 bg-white text-ink hover:bg-stone-100",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
} as const;

export type ButtonVariant = keyof typeof variants;

export function SubmitButton({
  children,
  pendingLabel = "Enviando…",
  variant = "primary",
  className = "",
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: ButtonVariant;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className={`rounded-md px-3 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} className="mt-1 text-xs text-red-700">
      {message}
    </p>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state.message) {
    return null;
  }
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={`rounded-md px-3 py-2 text-sm ${
        state.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
      }`}
    >
      {state.message}
    </p>
  );
}

export const inputClass =
  "mt-1 block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export const labelClass = "block text-sm font-medium text-stone-700";
