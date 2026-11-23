import "server-only";
import { requireUser } from "../auth";
import { ACTIVE_ORDER_STATUSES, type OrderStatus } from "../domain/orders";
import type { ProductCategory } from "../domain/products";
import type { ReservationStatus } from "../domain/reservations";
import { createSupabaseServerClient } from "../supabase/server";

export type StaffProduct = {
  id: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  priceCents: number;
  available: boolean;
};

export type OrderLine = {
  id: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
};

export type ActiveOrder = {
  id: string;
  tableNumber: number;
  status: OrderStatus;
  notes: string | null;
  createdAt: string;
  totalCents: number;
  itemCount: number;
  lines: OrderLine[];
};

export type Reservation = {
  id: string;
  customerName: string;
  phone: string;
  partySize: number;
  reservedAt: string;
  status: ReservationStatus;
  notes: string | null;
};

export async function listStaffProducts(): Promise<StaffProduct[]> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, description, category, price_cents, available")
    .order("category")
    .order("name")
    .returns<
      {
        id: string;
        name: string;
        description: string | null;
        category: ProductCategory;
        price_cents: number;
        available: boolean;
      }[]
    >();

  if (error) {
    console.error("listStaffProducts", error);
    throw new Error("No se pudo cargar la carta");
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    priceCents: row.price_cents,
    available: row.available,
  }));
}

export async function listActiveOrders(): Promise<ActiveOrder[]> {
  await requireUser();
  const supabase = await createSupabaseServerClient();

  const { data: summaries, error } = await supabase
    .from("order_summaries")
    .select("id, table_number, status, notes, created_at, total_cents, item_count")
    .in("status", [...ACTIVE_ORDER_STATUSES])
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<
      {
        id: string;
        table_number: number;
        status: OrderStatus;
        notes: string | null;
        created_at: string;
        total_cents: number;
        item_count: number;
      }[]
    >();

  if (error) {
    console.error("listActiveOrders", error);
    throw new Error("No se pudieron cargar las comandas");
  }

  if (summaries.length === 0) {
    return [];
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("id, order_id, product_name, quantity, unit_price_cents")
    .in(
      "order_id",
      summaries.map((order) => order.id),
    )
    .returns<
      {
        id: string;
        order_id: string;
        product_name: string;
        quantity: number;
        unit_price_cents: number;
      }[]
    >();

  if (itemsError) {
    console.error("listActiveOrders.items", itemsError);
    throw new Error("No se pudieron cargar las comandas");
  }

  const linesByOrder = new Map<string, OrderLine[]>();
  for (const item of items) {
    const lines = linesByOrder.get(item.order_id) ?? [];
    lines.push({
      id: item.id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPriceCents: item.unit_price_cents,
    });
    linesByOrder.set(item.order_id, lines);
  }

  return summaries.map((order) => ({
    id: order.id,
    tableNumber: order.table_number,
    status: order.status,
    notes: order.notes,
    createdAt: order.created_at,
    totalCents: order.total_cents,
    itemCount: order.item_count,
    lines: linesByOrder.get(order.id) ?? [],
  }));
}

export async function listUpcomingReservations(): Promise<Reservation[]> {
  await requireUser();
  const supabase = await createSupabaseServerClient();
  const since = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("reservations")
    .select("id, customer_name, phone, party_size, reserved_at, status, notes")
    .gte("reserved_at", since)
    .order("reserved_at", { ascending: true })
    .limit(200)
    .returns<
      {
        id: string;
        customer_name: string;
        phone: string;
        party_size: number;
        reserved_at: string;
        status: ReservationStatus;
        notes: string | null;
      }[]
    >();

  if (error) {
    console.error("listUpcomingReservations", error);
    throw new Error("No se pudieron cargar las reservas");
  }

  return data.map((row) => ({
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    partySize: row.party_size,
    reservedAt: row.reserved_at,
    status: row.status,
    notes: row.notes,
  }));
}
