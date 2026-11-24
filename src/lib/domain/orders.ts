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

function isNonNegativeSafeInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

export function calculateTotalCents(lines: readonly PricedLine[]): number {
  let total = 0;
  for (const { quantity, unitPriceCents } of lines) {
    if (!isNonNegativeSafeInteger(quantity)) {
      throw new RangeError(`Cantidad de línea inválida: ${quantity}`);
    }
    if (!isNonNegativeSafeInteger(unitPriceCents)) {
      throw new RangeError(`Precio unitario en céntimos inválido: ${unitPriceCents}`);
    }
    total += quantity * unitPriceCents;
    if (!Number.isSafeInteger(total)) {
      throw new RangeError("El total de la comanda supera el máximo representable");
    }
  }
  return total;
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
