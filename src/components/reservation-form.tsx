"use client";

import { useActionState } from "react";
import { requestReservation } from "@/lib/actions/reservations";
import { LAST_BOOKING_TIME, OPENING_TIME } from "@/lib/domain/reservations";
import { initialActionState } from "@/lib/validation/form";
import { FieldError, FormMessage, inputClass, labelClass, SubmitButton } from "./forms";

export function ReservationForm() {
  const [state, formAction] = useActionState(requestReservation, initialActionState);
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div>
        <label htmlFor="customerName" className={labelClass}>
          Nombre
        </label>
        <input
          id="customerName"
          name="customerName"
          autoComplete="name"
          required
          aria-invalid={Boolean(errors.customerName)}
          aria-describedby="customerName-error"
          className={inputClass}
        />
        <FieldError id="customerName-error" message={errors.customerName} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClass}>
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="600 123 456"
            required
            aria-invalid={Boolean(errors.phone)}
            aria-describedby="phone-error"
            className={inputClass}
          />
          <FieldError id="phone-error" message={errors.phone} />
        </div>
        <div>
          <label htmlFor="partySize" className={labelClass}>
            Personas
          </label>
          <input
            id="partySize"
            name="partySize"
            type="number"
            min={1}
            max={20}
            defaultValue={2}
            required
            aria-invalid={Boolean(errors.partySize)}
            aria-describedby="partySize-error"
            className={inputClass}
          />
          <FieldError id="partySize-error" message={errors.partySize} />
        </div>
        <div>
          <label htmlFor="date" className={labelClass}>
            Fecha
          </label>
          <input
            id="date"
            name="date"
            type="date"
            required
            aria-invalid={Boolean(errors.date)}
            aria-describedby="date-error"
            className={inputClass}
          />
          <FieldError id="date-error" message={errors.date} />
        </div>
        <div>
          <label htmlFor="time" className={labelClass}>
            Hora
          </label>
          <input
            id="time"
            name="time"
            type="time"
            min={OPENING_TIME}
            max={LAST_BOOKING_TIME}
            step={900}
            required
            aria-invalid={Boolean(errors.time)}
            aria-describedby="time-error"
            className={inputClass}
          />
          <FieldError id="time-error" message={errors.time} />
        </div>
      </div>
      <div>
        <label htmlFor="notes" className={labelClass}>
          Comentarios (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={300}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby="notes-error"
          className={inputClass}
        />
        <FieldError id="notes-error" message={errors.notes} />
      </div>
      <SubmitButton pendingLabel="Enviando…" className="w-full sm:w-auto">
        Solicitar reserva
      </SubmitButton>
    </form>
  );
}
