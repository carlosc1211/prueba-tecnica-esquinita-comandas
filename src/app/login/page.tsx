import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = { title: "Acceso personal" };

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-sm px-4 py-12">
      <h1 className="font-display text-2xl font-bold">Acceso del personal</h1>
      <p className="mt-1 mb-6 text-sm text-stone-600">Comandas, carta y reservas.</p>
      <div className="rounded-xl border border-stone-200 bg-white p-5">
        <LoginForm />
      </div>
    </main>
  );
}
