"use client";

import { useActionState } from "react";
import { initialActionState, type ActionState } from "@/lib/validation/form";
import { SubmitButton, type ButtonVariant } from "./forms";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

export function ActionButton({
  action,
  fields,
  label,
  pendingLabel = "…",
  variant = "secondary",
}: {
  action: Action;
  fields: Record<string, string>;
  label: string;
  pendingLabel?: string;
  variant?: ButtonVariant;
}) {
  const [state, formAction] = useActionState(action, initialActionState);
  return (
    <form action={formAction} className="inline-flex flex-col items-start">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton variant={variant} pendingLabel={pendingLabel} className="px-2.5 py-1 text-xs">
        {label}
      </SubmitButton>
      {!state.ok && state.message ? (
        <span role="alert" className="mt-1 text-xs text-red-700">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
