import { describe, expect, it } from "vitest";
import { z } from "zod";
import { formDataToObject, toFieldErrors } from "@/lib/validation/form";
import {
  createReservationSchema,
  loginSchema,
  orderSchema,
  orderStatusSchema,
  productAvailabilitySchema,
  productSchema,
} from "@/lib/validation/schemas";

const UUID = "3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e";
const NOW = new Date("2026-12-01T11:30:00.000Z");

describe("loginSchema", () => {
  it("normaliza el email", () => {
    const parsed = loginSchema.parse({ email: "  Staff@Esquinita.ES ", password: "secreto1" });
    expect(parsed.email).toBe("staff@esquinita.es");
  });

  it("rechaza email inválido y contraseña corta", () => {
    const result = loginSchema.safeParse({ email: "nope", password: "123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(toFieldErrors(result.error)).sort()).toEqual(["email", "password"]);
    }
  });
});

describe("productSchema", () => {
  it("convierte el precio a céntimos y el checkbox a booleano", () => {
    const parsed = productSchema.parse({
      name: "Brascada",
      description: "",
      category: "bocadillos",
      price: "7,50",
      available: "on",
    });
    expect(parsed).toEqual({
      name: "Brascada",
      description: null,
      category: "bocadillos",
      price: 750,
      available: true,
    });
  });

  it("checkbox ausente significa no disponible", () => {
    const parsed = productSchema.parse({ name: "Caña", category: "bebidas", price: "2" });
    expect(parsed.available).toBe(false);
  });

  it.each([
    [{ name: "A", category: "tapas", price: "5" }, "name"],
    [{ name: "Bravas", category: "pizzas", price: "5" }, "category"],
    [{ name: "Bravas", category: "tapas", price: "cinco" }, "price"],
    [{ name: "Bravas", category: "tapas", price: "1000,01" }, "price"],
    [{ name: "Bravas", category: "tapas", price: "5", description: "x".repeat(241) }, "description"],
  ])("rechaza entrada inválida (%#)", (input, field) => {
    const result = productSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toFieldErrors(result.error)).toHaveProperty(field);
    }
  });

  it("valida la disponibilidad", () => {
    expect(productAvailabilitySchema.parse({ id: UUID, available: "false" })).toEqual({
      id: UUID,
      available: false,
    });
    expect(productAvailabilitySchema.safeParse({ id: "1", available: "true" }).success).toBe(
      false,
    );
  });
});

describe("orderSchema", () => {
  const items = JSON.stringify([{ productId: UUID, quantity: 2 }]);

  it("acepta una comanda válida", () => {
    const parsed = orderSchema.parse({ tableNumber: "4", notes: "  ", items });
    expect(parsed).toEqual({
      tableNumber: 4,
      notes: null,
      items: [{ productId: UUID, quantity: 2 }],
    });
  });

  it.each(["0", "51", "3.5", "abc"])("rechaza mesa %s", (tableNumber) => {
    const result = orderSchema.safeParse({ tableNumber, items });
    expect(result.success).toBe(false);
  });

  it("rechaza comanda vacía, JSON roto y cantidades fuera de rango", () => {
    expect(orderSchema.safeParse({ tableNumber: "1", items: "[]" }).success).toBe(false);
    expect(orderSchema.safeParse({ tableNumber: "1", items: "{roto" }).success).toBe(false);
    expect(
      orderSchema.safeParse({
        tableNumber: "1",
        items: JSON.stringify([{ productId: UUID, quantity: 100 }]),
      }).success,
    ).toBe(false);
    expect(
      orderSchema.safeParse({
        tableNumber: "1",
        items: JSON.stringify([{ productId: "no-uuid", quantity: 1 }]),
      }).success,
    ).toBe(false);
  });

  it("valida estados de comanda", () => {
    expect(orderStatusSchema.safeParse({ id: UUID, status: "servida" }).success).toBe(true);
    expect(orderStatusSchema.safeParse({ id: UUID, status: "perdida" }).success).toBe(false);
  });
});

describe("createReservationSchema", () => {
  const schema = createReservationSchema(NOW);
  const base = {
    customerName: "Lucía Martínez",
    phone: "600  123 456",
    partySize: "4",
    date: "2026-12-05",
    time: "21:00",
    notes: "",
  };

  it("acepta una reserva válida y la convierte a UTC", () => {
    expect(schema.parse(base)).toEqual({
      customerName: "Lucía Martínez",
      phone: "600 123 456",
      partySize: 4,
      reservedAt: "2026-12-05T20:00:00.000Z",
      notes: null,
    });
  });

  it.each([
    [{ date: "2026-11-30" }, "date"],
    [{ date: "2027-03-01" }, "date"],
    [{ date: "2026-12-01", time: "12:00" }, "date"],
    [{ time: "11:59" }, "time"],
    [{ time: "23:15" }, "time"],
    [{ partySize: "0" }, "partySize"],
    [{ partySize: "21" }, "partySize"],
    [{ phone: "12345" }, "phone"],
    [{ customerName: "L" }, "customerName"],
  ])("rechaza %o", (override, field) => {
    const result = schema.safeParse({ ...base, ...override });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toFieldErrors(result.error)).toHaveProperty(field);
    }
  });

  it("acepta los límites horarios 12:00 y 23:00", () => {
    expect(schema.safeParse({ ...base, time: "12:00" }).success).toBe(true);
    expect(schema.safeParse({ ...base, time: "23:00" }).success).toBe(true);
  });
});

describe("form helpers", () => {
  it("ignora campos internos de Server Actions y ficheros", () => {
    const formData = new FormData();
    formData.set("name", "Bravas");
    formData.set("$ACTION_ID_abc", "");
    formData.set("file", new Blob(["x"]));
    expect(formDataToObject(formData)).toEqual({ name: "Bravas" });
  });

  it("toma el primer error por campo y usa 'form' para errores raíz", () => {
    const result = z
      .object({ a: z.string().min(3, "corto").regex(/x/, "sin x") })
      .refine(() => false, "raíz")
      .safeParse({ a: "y" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(toFieldErrors(result.error)).toEqual({ a: "corto", form: "raíz" });
    }
  });
});
