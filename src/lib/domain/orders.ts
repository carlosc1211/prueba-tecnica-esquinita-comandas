export const ORDER_STATUSES = [
  "abierta",
  "en_cocina",
  "servida",
  "pagada",
  "cancelada",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ACTIVE_ORDER_STATUSES: readonly OrderStatus[] = [
  "abierta",
  "en_cocina",
  "servida",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  abierta: "Abierta",
  en_cocina: "En cocina",
  servida: "Servida",
  pagada: "Pagada",
  cancelada: "Cancelada",
};

const ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  abierta: ["en_cocina", "cancelada"],
  en_cocina: ["servida", "cancelada"],
  servida: ["pagada"],
  pagada: [],
  cancelada: [],
};

export function nextOrderStatuses(from: OrderStatus): readonly OrderStatus[] {
  return ORDER_TRANSITIONS[from];
}

export function canTransitionOrder(from: OrderStatus, to: OrderStatus): boolean {
  return ORDER_TRANSITIONS[from].includes(to);
}

export type PricedLine = {
  quantity: number;
  unitPriceCents: number;
};

export function calculateTotalCents(lines: readonly PricedLine[]): number {
  return lines.reduce((total, line) => total + line.quantity * line.unitPriceCents, 0);
}

export type OrderLineInput = {
  productId: string;
  quantity: number;
};

export function mergeOrderLines(lines: readonly OrderLineInput[]): OrderLineInput[] {
  const merged = new Map<string, number>();
  for (const line of lines) {
    merged.set(line.productId, (merged.get(line.productId) ?? 0) + line.quantity);
  }
  return Array.from(merged, ([productId, quantity]) => ({ productId, quantity }));
}
