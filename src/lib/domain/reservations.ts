export const RESERVATION_STATUSES = ["pendiente", "confirmada", "cancelada"] as const;

export type ReservationStatus = (typeof RESERVATION_STATUSES)[number];

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  pendiente: "Pendiente",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
};

const RESERVATION_TRANSITIONS: Record<ReservationStatus, readonly ReservationStatus[]> = {
  pendiente: ["confirmada", "cancelada"],
  confirmada: ["cancelada"],
  cancelada: [],
};

export function nextReservationStatuses(from: ReservationStatus): readonly ReservationStatus[] {
  return RESERVATION_TRANSITIONS[from];
}

export function canTransitionReservation(
  from: ReservationStatus,
  to: ReservationStatus,
): boolean {
  return RESERVATION_TRANSITIONS[from].includes(to);
}

export const OPENING_TIME = "12:00";
export const LAST_BOOKING_TIME = "23:00";
export const MAX_DAYS_AHEAD = 60;
