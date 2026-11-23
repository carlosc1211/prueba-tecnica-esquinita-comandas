import type { Metadata } from "next";
import { ReservationForm } from "@/components/reservation-form";

export const metadata: Metadata = { title: "Reservar mesa" };

export default function ReservePage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="font-display text-3xl font-bold">Reservar mesa</h1>
      <p className="mt-2 mb-6 text-sm text-stone-600">
        Reservas de 12:00 a 23:00, hasta 60 días vista. Te llamaremos para confirmar.
      </p>
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <ReservationForm />
      </div>
    </main>
  );
}
