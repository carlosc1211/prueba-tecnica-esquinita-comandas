"use server";

import { refresh } from "next/cache";
import { requireUser } from "../auth";
import { canTransitionReservation, type ReservationStatus } from "../domain/reservations";
import { createSupabasePublicClient } from "../supabase/public";
import { createSupabaseServerClient } from "../supabase/server";
import { createReservationSchema, reservationStatusSchema } from "../validation/schemas";
import {
  failure,
  formDataToObject,
  invalid,
  success,
  type ActionState,
} from "../validation/form";

export async function requestReservation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createReservationSchema(new Date()).safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return invalid(parsed.error);
  }

  const supabase = createSupabasePublicClient();
  if (!supabase) {
    return failure("Reservas no disponibles en este momento");
  }

  const { error } = await supabase.from("reservations").insert({
    customer_name: parsed.data.customerName,
    phone: parsed.data.phone,
    party_size: parsed.data.partySize,
    reserved_at: parsed.data.reservedAt,
    notes: parsed.data.notes,
  });

  if (error) {
    console.error("requestReservation", error);
    return failure("No se pudo registrar la reserva. Inténtalo de nuevo.");
  }

  return success("¡Solicitud recibida! Te llamaremos para confirmarla.");
}

export async function updateReservationStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();
  const parsed = reservationStatusSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return invalid(parsed.error);
  }

  const supabase = await createSupabaseServerClient();
  const { data: current, error: readError } = await supabase
    .from("reservations")
    .select("status")
    .eq("id", parsed.data.id)
    .maybeSingle<{ status: ReservationStatus }>();

  if (readError) {
    console.error("updateReservationStatus.read", readError);
    return failure("No se pudo actualizar la reserva");
  }
  if (!current) {
    return failure("La reserva no existe");
  }
  if (!canTransitionReservation(current.status, parsed.data.status)) {
    return failure("Cambio de estado no permitido");
  }

  const { data: updated, error } = await supabase
    .from("reservations")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .eq("status", current.status)
    .select("id");

  if (error) {
    console.error("updateReservationStatus", error);
    return failure("No se pudo actualizar la reserva");
  }
  if (updated.length === 0) {
    return failure("La reserva ha cambiado. Recarga.");
  }

  refresh();
  return success("Reserva actualizada");
}
