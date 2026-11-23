import type { Metadata } from "next";
import { Suspense } from "react";
import { ActionButton } from "@/components/action-button";
import { OrderForm } from "@/components/order-form";
import { updateOrderStatus } from "@/lib/actions/orders";
import { listActiveOrders, listStaffProducts } from "@/lib/data/staff";
import { formatEuros } from "@/lib/domain/money";
import {
  nextOrderStatuses,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/domain/orders";
import { formatBusinessTime } from "@/lib/domain/time";

export const metadata: Metadata = { title: "Comandas" };

const statusStyles: Record<OrderStatus, string> = {
  abierta: "bg-sky-100 text-sky-800",
  en_cocina: "bg-amber-100 text-amber-800",
  servida: "bg-green-100 text-green-800",
  pagada: "bg-stone-200 text-stone-700",
  cancelada: "bg-red-100 text-red-800",
};

const actionLabels: Record<OrderStatus, string> = {
  abierta: "Reabrir",
  en_cocina: "A cocina",
  servida: "Servida",
  pagada: "Cobrar",
  cancelada: "Cancelar",
};

async function OrdersBoard() {
  const [orders, products] = await Promise.all([listActiveOrders(), listStaffProducts()]);
  const available = products
    .filter((product) => product.available)
    .map(({ id, name, description, category, priceCents }) => ({
      id,
      name,
      description,
      category,
      priceCents,
    }));

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <section aria-labelledby="new-order" className="rounded-xl border border-stone-200 bg-white p-4">
        <h2 id="new-order" className="mb-3 font-semibold">
          Nueva comanda
        </h2>
        <OrderForm products={available} />
      </section>

      <section aria-labelledby="active-orders">
        <h2 id="active-orders" className="mb-3 font-semibold">
          Comandas activas ({orders.length})
        </h2>
        {orders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
            No hay comandas activas.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {orders.map((order) => (
              <li key={order.id} className="rounded-xl border border-stone-200 bg-white p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-semibold">Mesa {order.tableNumber}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[order.status]}`}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
                <p className="mb-2 text-xs text-stone-500">
                  {formatBusinessTime(order.createdAt)} · {order.itemCount} uds.
                </p>
                <ul className="mb-2 space-y-0.5 text-sm">
                  {order.lines.map((line) => (
                    <li key={line.id} className="flex justify-between gap-2">
                      <span>
                        {line.quantity}× {line.productName}
                      </span>
                      <span className="tabular-nums text-stone-600">
                        {formatEuros(line.quantity * line.unitPriceCents)}
                      </span>
                    </li>
                  ))}
                </ul>
                {order.notes ? (
                  <p className="mb-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-900">
                    {order.notes}
                  </p>
                ) : null}
                <div className="flex items-center justify-between border-t border-stone-100 pt-2">
                  <strong className="tabular-nums">{formatEuros(order.totalCents)}</strong>
                  <div className="flex gap-1">
                    {nextOrderStatuses(order.status).map((status) => (
                      <ActionButton
                        key={status}
                        action={updateOrderStatus}
                        fields={{ id: order.id, status }}
                        label={actionLabels[status]}
                        variant={status === "cancelada" ? "danger" : "secondary"}
                      />
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <main>
      <h1 className="sr-only">Comandas</h1>
      <Suspense fallback={<p className="text-sm text-stone-500">Cargando comandas…</p>}>
        <OrdersBoard />
      </Suspense>
    </main>
  );
}
