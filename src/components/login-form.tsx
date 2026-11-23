"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/validation/form";
import { FieldError, FormMessage, inputClass, labelClass, SubmitButton } from "./forms";

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialActionState);
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          aria-invalid={Boolean(state.fieldErrors.email)}
          aria-describedby="email-error"
          className={inputClass}
        />
        <FieldError id="email-error" message={state.fieldErrors.email} />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors.password)}
          aria-describedby="password-error"
          className={inputClass}
        />
        <FieldError id="password-error" message={state.fieldErrors.password} />
      </div>
      <SubmitButton pendingLabel="Entrando…" className="w-full">
        Entrar
      </SubmitButton>
    </form>
  );
}
