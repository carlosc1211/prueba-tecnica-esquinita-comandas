import { z } from "zod";
import { parseEurosToCents } from "../domain/money";
import { ORDER_STATUSES } from "../domain/orders";
import { PRODUCT_CATEGORIES } from "../domain/products";
import {
  LAST_BOOKING_TIME,
  MAX_DAYS_AHEAD,
  OPENING_TIME,
  RESERVATION_STATUSES,
} from "../domain/reservations";
import { zonedLocalToUtc } from "../domain/time";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .transform((value) => (value ? value : null));

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Email no válido")),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(80, "Máximo 80 caracteres"),
  description: optionalText(240),
  category: z.enum(PRODUCT_CATEGORIES, "Categoría no válida"),
  price: z
    .string()
    .transform((value, ctx) => {
      const cents = parseEurosToCents(value);
      if (cents === null || cents > 100000) {
        ctx.addIssue({ code: "custom", message: "Precio no válido (ej. 6,50)" });
        return z.NEVER;
      }
      return cents;
    }),
  available: z
    .union([z.literal("on"), z.literal("true"), z.literal("false")])
    .optional()
    .transform((value) => value === "on" || value === "true"),
});

export const uuidSchema = z.uuid("Identificador no válido");

export const productIdSchema = z.object({ id: uuidSchema });

export const productAvailabilitySchema = z.object({
  id: uuidSchema,
  available: z.enum(["true", "false"]).transform((value) => value === "true"),
});

const orderLineSchema = z.object({
  productId: uuidSchema,
  quantity: z.number().int().min(1, "Cantidad mínima 1").max(99, "Cantidad máxima 99"),
});

export const orderSchema = z.object({
  tableNumber: z.coerce
    .number("Mesa no válida")
    .int("Mesa no válida")
    .min(1, "Mesa entre 1 y 50")
    .max(50, "Mesa entre 1 y 50"),
  notes: optionalText(300),
  items: z
    .string()
    .transform((value, ctx) => {
      try {
        return JSON.parse(value) as unknown;
      } catch {
        ctx.addIssue({ code: "custom", message: "Líneas no válidas" });
        return z.NEVER;
      }
    })
    .pipe(
      z
        .array(orderLineSchema, "Líneas no válidas")
        .min(1, "Añade al menos un producto")
        .max(50, "Máximo 50 líneas"),
    ),
});

export const orderStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(ORDER_STATUSES, "Estado no válido"),
});

export const reservationStatusSchema = z.object({
  id: uuidSchema,
  status: z.enum(RESERVATION_STATUSES, "Estado no válido"),
});

const PHONE_PATTERN = /^\+?[0-9 ]{9,15}$/;

export function createReservationSchema(now: Date) {
  const maxDate = new Date(now.getTime() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000);
  return z
    .object({
      customerName: z
        .string()
        .trim()
        .min(2, "Mínimo 2 caracteres")
        .max(80, "Máximo 80 caracteres"),
      phone: z.string().trim().regex(PHONE_PATTERN, "Teléfono no válido"),
      partySize: z.coerce
        .number("Número de personas no válido")
        .int("Número de personas no válido")
        .min(1, "Entre 1 y 20 personas")
        .max(20, "Entre 1 y 20 personas"),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida"),
      time: z
        .string()
        .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora no válida")
        .refine(
          (value) => value >= OPENING_TIME && value <= LAST_BOOKING_TIME,
          `Reservas entre las ${OPENING_TIME} y las ${LAST_BOOKING_TIME}`,
        ),
      notes: optionalText(300),
    })
    .transform((value, ctx) => {
      const reservedAt = zonedLocalToUtc(value.date, value.time);
      if (!reservedAt) {
        ctx.addIssue({ code: "custom", path: ["date"], message: "Fecha no válida" });
        return z.NEVER;
      }
      if (reservedAt.getTime() <= now.getTime()) {
        ctx.addIssue({ code: "custom", path: ["date"], message: "La fecha debe ser futura" });
        return z.NEVER;
      }
      if (reservedAt.getTime() > maxDate.getTime()) {
        ctx.addIssue({
          code: "custom",
          path: ["date"],
          message: `Máximo ${MAX_DAYS_AHEAD} días de antelación`,
        });
        return z.NEVER;
      }
      return {
        customerName: value.customerName,
        phone: value.phone.replace(/\s+/g, " "),
        partySize: value.partySize,
        reservedAt: reservedAt.toISOString(),
        notes: value.notes,
      };
    });
}

export type ProductInput = z.infer<typeof productSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type ReservationInput = z.infer<ReturnType<typeof createReservationSchema>>;
