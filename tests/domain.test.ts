import { describe, expect, it } from "vitest";
import { formatEuros, parseEurosToCents } from "@/lib/domain/money";
import {
  calculateTotalCents,
  canTransitionOrder,
  mergeOrderLines,
  nextOrderStatuses,
  ORDER_STATUSES,
} from "@/lib/domain/orders";
import {
  filterGroupsByCategory,
  groupByCategory,
  isMenuFilter,
  MENU_FILTER_LABELS,
  MENU_FILTERS,
  PRODUCT_CATEGORIES,
} from "@/lib/domain/products";
import {
  canTransitionReservation,
  nextReservationStatuses,
} from "@/lib/domain/reservations";
import {
  formatBusinessDateTime,
  formatBusinessTime,
  zonedLocalToUtc,
} from "@/lib/domain/time";

describe("money", () => {
  it.each([
    ["6,50", 650],
    ["6.5", 650],
    ["7", 700],
    ["0", 0],
    ["1000", 100000],
    [" 12,05 € ", 1205],
  ])("parsea %s a %i céntimos", (input, expected) => {
    expect(parseEurosToCents(input)).toBe(expected);
  });

  it.each(["", "abc", "-1", "6,555", "12345", "1,2,3"])("rechaza %s", (input) => {
    expect(parseEurosToCents(input)).toBeNull();
  });

  it("formatea en es-ES con euros", () => {
    expect(formatEuros(650).replace(/\s/g, " ")).toBe("6,50 €");
    expect(formatEuros(0).replace(/\s/g, " ")).toBe("0,00 €");
  });
});

describe("orders", () => {
  it("permite el flujo feliz abierta → en_cocina → servida → pagada", () => {
    expect(canTransitionOrder("abierta", "en_cocina")).toBe(true);
    expect(canTransitionOrder("en_cocina", "servida")).toBe(true);
    expect(canTransitionOrder("servida", "pagada")).toBe(true);
  });

  it("impide saltos y retrocesos", () => {
    expect(canTransitionOrder("abierta", "pagada")).toBe(false);
    expect(canTransitionOrder("servida", "abierta")).toBe(false);
    expect(canTransitionOrder("servida", "cancelada")).toBe(false);
  });

  it("los estados finales no tienen salida", () => {
    expect(nextOrderStatuses("pagada")).toEqual([]);
    expect(nextOrderStatuses("cancelada")).toEqual([]);
  });

  it("ningún estado transiciona a sí mismo", () => {
    for (const status of ORDER_STATUSES) {
      expect(canTransitionOrder(status, status)).toBe(false);
    }
  });

  it("calcula el total en céntimos", () => {
    expect(
      calculateTotalCents([
        { quantity: 2, unitPriceCents: 650 },
        { quantity: 3, unitPriceCents: 200 },
      ]),
    ).toBe(1900);
    expect(calculateTotalCents([])).toBe(0);
  });

  it("fusiona líneas repetidas del mismo producto", () => {
    expect(
      mergeOrderLines([
        { productId: "a", quantity: 1 },
        { productId: "b", quantity: 2 },
        { productId: "a", quantity: 3 },
      ]),
    ).toEqual([
      { productId: "a", quantity: 4 },
      { productId: "b", quantity: 2 },
    ]);
  });
});

describe("reservations", () => {
  it("pendiente puede confirmarse o cancelarse", () => {
    expect(nextReservationStatuses("pendiente")).toEqual(["confirmada", "cancelada"]);
  });

  it("confirmada solo puede cancelarse y cancelada es final", () => {
    expect(canTransitionReservation("confirmada", "cancelada")).toBe(true);
    expect(canTransitionReservation("confirmada", "pendiente")).toBe(false);
    expect(nextReservationStatuses("cancelada")).toEqual([]);
  });
});

describe("products", () => {
  it("agrupa por categoría en el orden de la carta y omite vacías", () => {
    const groups = groupByCategory([
      { id: "1", category: "tapas" as const },
      { id: "2", category: "bocadillos" as const },
      { id: "3", category: "tapas" as const },
    ]);
    expect(groups.map((group) => group.category)).toEqual(["bocadillos", "tapas"]);
    expect(groups[1].items).toHaveLength(2);
  });
});

describe("menu filter", () => {
  const groups = groupByCategory([
    { id: "1", category: "bocadillos" as const },
    { id: "2", category: "tapas" as const },
    { id: "3", category: "bebidas" as const },
    { id: "4", category: "tapas" as const },
  ]);

  it("ofrece Todas seguido de las categorías en el orden de la carta", () => {
    expect(MENU_FILTERS).toEqual(["todas", "bocadillos", "tapas", "bebidas", "postres"]);
    expect(MENU_FILTERS.map((filter) => MENU_FILTER_LABELS[filter])).toEqual([
      "Todas",
      "Bocadillos",
      "Tapas",
      "Bebidas",
      "Postres",
    ]);
  });

  it("con 'todas' devuelve todos los grupos sin alterar el orden", () => {
    const result = filterGroupsByCategory(groups, "todas");
    expect(result).toEqual(groups);
    expect(result).not.toBe(groups);
  });

  it.each(["bocadillos", "tapas", "bebidas"] as const)(
    "con '%s' devuelve solo esa categoría",
    (category) => {
      const result = filterGroupsByCategory(groups, category);
      expect(result).toHaveLength(1);
      expect(result[0].category).toBe(category);
      expect(result[0].items.every((item) => item.category === category)).toBe(true);
    },
  );

  it("mantiene todos los productos de la categoría elegida", () => {
    expect(filterGroupsByCategory(groups, "tapas")[0].items.map((item) => item.id)).toEqual([
      "2",
      "4",
    ]);
  });

  it("devuelve lista vacía si la categoría no tiene productos", () => {
    expect(filterGroupsByCategory(groups, "postres")).toEqual([]);
  });

  it.each(MENU_FILTERS)("devuelve lista vacía con entrada vacía y filtro '%s'", (filter) => {
    expect(filterGroupsByCategory([], filter)).toEqual([]);
  });

  it.each([...MENU_FILTERS])("acepta el filtro válido '%s'", (value) => {
    expect(isMenuFilter(value)).toBe(true);
  });

  it.each(["", "Todas", "TAPAS", "postre", "bebida ", "comidas", null, undefined, 1, {}])(
    "rechaza el filtro inválido %j",
    (value) => {
      expect(isMenuFilter(value)).toBe(false);
    },
  );

  it("cubre exactamente todas las categorías de producto", () => {
    expect(MENU_FILTERS.slice(1)).toEqual([...PRODUCT_CATEGORIES]);
  });
});

describe("time", () => {
  it("convierte hora de Madrid en invierno (UTC+1)", () => {
    expect(zonedLocalToUtc("2026-12-15", "21:30")?.toISOString()).toBe(
      "2026-12-15T20:30:00.000Z",
    );
  });

  it("convierte hora de Madrid en verano (UTC+2)", () => {
    expect(zonedLocalToUtc("2027-07-10", "14:00")?.toISOString()).toBe(
      "2027-07-10T12:00:00.000Z",
    );
  });

  it("gestiona el día del cambio de hora", () => {
    expect(zonedLocalToUtc("2027-03-28", "13:00")?.toISOString()).toBe(
      "2027-03-28T11:00:00.000Z",
    );
  });

  it.each([
    ["2026-02-30", "13:00"],
    ["2026-13-01", "13:00"],
    ["2026-12-01", "24:00"],
    ["01/12/2026", "13:00"],
  ])("rechaza %s %s", (date, time) => {
    expect(zonedLocalToUtc(date, time)).toBeNull();
  });

  it("formatea horas en la zona del negocio", () => {
    expect(formatBusinessTime("2026-12-15T20:30:00.000Z")).toBe("21:30");
    expect(formatBusinessTime("2027-07-10T12:00:00.000Z")).toBe("14:00");
  });

  it("formatea fecha y hora en español", () => {
    const text = formatBusinessDateTime("2026-12-15T20:30:00.000Z");
    expect(text).toContain("15");
    expect(text).toContain("dic");
    expect(text).toContain("21:30");
  });
});
