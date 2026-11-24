const formatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});

export function formatEuros(cents: number): string {
  if (!Number.isSafeInteger(cents) || cents < 0) {
    throw new RangeError(`Importe en céntimos inválido: ${cents}`);
  }
  return formatter.format(cents / 100);
}

export function parseEurosToCents(input: string): number | null {
  const normalized = input.trim().replace(/\s|€/g, "").replace(",", ".");
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }
  const [whole, fraction = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
