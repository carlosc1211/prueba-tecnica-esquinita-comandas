import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "La Esquinita del Turia · Bocadillos y tapas",
    template: "%s · La Esquinita del Turia",
  },
  description:
    "Carta, reservas y gestión de comandas de La Esquinita del Turia, bocadillos y tapas en Valencia.",
};

export const viewport: Viewport = {
  themeColor: "#c2410c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="border-b border-stone-200 bg-white">
          <nav
            aria-label="Principal"
            className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3"
          >
            <Link href="/" className="font-display text-xl font-bold text-brand-700">
              La Esquinita del Turia
            </Link>
            <div className="flex items-center gap-4 text-sm font-medium">
              <Link href="/" className="hover:text-brand-600">
                Carta
              </Link>
              <Link href="/reservar" className="hover:text-brand-600">
                Reservar
              </Link>
              <Link
                href="/panel"
                className="rounded-md bg-ink px-3 py-1.5 text-white hover:bg-stone-700"
              >
                Personal
              </Link>
            </div>
          </nav>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-500">
          La Esquinita del Turia · Valencia · Proyecto de demostración
        </footer>
      </body>
    </html>
  );
}
