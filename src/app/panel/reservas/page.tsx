import type { Metadata } from "next";
import { Suspense } from "react";
import { ActionButton } from "@/components/action-button";
import { updateReservationStatus } from "@/lib/actions/reservations";
import { listUpcomingReservations } from "@/lib/data/staff";
import {
  nextReservationStatuses,
  RESERVATION_STATUS_LABELS,
  type ReservationStatus,
} from "@/lib/domain/reservations";
import { formatBusinessDateTime } from "@/lib/domain/time";

export const metadata: Metadata = { title: "Reservas" };

const statusStyles: Record<ReservationStatus, string> = {
  pendiente: "bg-amber-100 text-amber-800",
  confirmada: "bg-green-100 text-green-800",
  cancelada: "bg-red-100 text-red-800",
};

const actionLabels: Record<ReservationStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmar",
  cancelada: "Cancelar",
};

async function ReservationList() {
  const reservations = await listUpcomingReservations();

  if (reservations.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
        No hay reservas próximas.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white">
      {reservations.map((reservation) => (
        <li
          key={reservation.id}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="font-medium">
              {reservation.customerName} · {reservation.partySize} pers.
            </p>
            <p className="text-xs text-stone-500">
              {formatBusinessDateTime(reservation.reservedAt)} ·{" "}
              <a href={`tel:${reservation.phone.replace(/\s/g, "")}`} className="underline">
                {reservation.phone}
              </a>
            </p>
            {reservation.notes ? (
              <p className="mt-1 text-xs text-stone-600">{reservation.notes}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[reservation.status]}`}
            >
              {RESERVATION_STATUS_LABELS[reservation.status]}
            </span>
            {nextReservationStatuses(reservation.status).map((status) => (
              <ActionButton
                key={status}
                action={updateReservationStatus}
                fields={{ id: reservation.id, status }}
                label={actionLabels[status]}
                variant={status === "cancelada" ? "danger" : "secondary"}
              />
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function ReservationsPage() {
  return (
    <main>
      <h1 className="mb-3 font-semibold">Próximas reservas</h1>
      <Suspense fallback={<p className="text-sm text-stone-500">Cargando reservas…</p>}>
        <ReservationList />
      </Suspense>
    </main>
  );
}
