import Link from "next/link";
import { MenuCategoryFilter } from "@/components/menu-category-filter";
import { getPublicMenu } from "@/lib/data/menu";
import { groupByCategory } from "@/lib/domain/products";

export default async function HomePage() {
  const menu = await getPublicMenu();
  const groups = groupByCategory(menu);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <section className="mb-10 rounded-2xl bg-brand-50 px-6 py-10 text-center">
        <h1 className="font-display text-3xl font-bold text-brand-700 sm:text-4xl">
          Bocadillos y tapas de toda la vida
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-stone-700">
          Almuerzos valencianos, tapas para compartir y buen ambiente junto al Turia.
        </p>
        <Link
          href="/reservar"
          className="mt-6 inline-block rounded-md bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Reservar mesa
        </Link>
      </section>

      <h2 className="mb-4 font-display text-2xl font-bold">Nuestra carta</h2>
      {groups.length === 0 ? (
        <p className="text-stone-600">La carta se está actualizando. Vuelve en unos minutos.</p>
      ) : (
        <MenuCategoryFilter groups={groups} />
      )}
    </main>
  );
}
