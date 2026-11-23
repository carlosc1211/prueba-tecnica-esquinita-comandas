import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/lib/actions/auth";
import { getStaffUser } from "@/lib/auth";
import { SubmitButton } from "@/components/forms";

const links = [
  { href: "/panel", label: "Comandas" },
  { href: "/panel/carta", label: "Carta" },
  { href: "/panel/reservas", label: "Reservas" },
] as const;

async function SessionBadge() {
  const user = await getStaffUser();
  if (!user) {
    return null;
  }
  return (
    <form action={logout} className="flex items-center gap-2 text-xs text-stone-600">
      <span className="hidden sm:inline">{user.email}</span>
      <SubmitButton variant="secondary" pendingLabel="Saliendo…" className="px-2 py-1 text-xs">
        Salir
      </SubmitButton>
    </form>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Panel" className="flex gap-1 rounded-lg bg-stone-200 p-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 font-medium hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Suspense fallback={<span className="text-xs text-stone-400">Cargando sesión…</span>}>
          <SessionBadge />
        </Suspense>
      </div>
      {children}
    </div>
  );
}
