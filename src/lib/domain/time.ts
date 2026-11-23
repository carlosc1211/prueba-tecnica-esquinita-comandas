export const BUSINESS_TIME_ZONE = "Europe/Madrid";

function offsetMinutesAt(instant: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(
    value("year"),
    value("month") - 1,
    value("day"),
    value("hour"),
    value("minute"),
    value("second"),
  );
  return Math.round((asUtc - instant.getTime()) / 60000);
}

export function zonedLocalToUtc(
  date: string,
  time: string,
  timeZone: string = BUSINESS_TIME_ZONE,
): Date | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!dateMatch || !timeMatch) {
    return null;
  }
  const [year, month, day] = dateMatch.slice(1).map(Number);
  const [hour, minute] = timeMatch.slice(1).map(Number);
  const naiveUtc = Date.UTC(year, month - 1, day, hour, minute);
  const probe = new Date(naiveUtc);
  if (probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) {
    return null;
  }
  const firstGuess = naiveUtc - offsetMinutesAt(probe, timeZone) * 60000;
  const corrected = naiveUtc - offsetMinutesAt(new Date(firstGuess), timeZone) * 60000;
  return new Date(corrected);
}

export function formatBusinessDateTime(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatBusinessTime(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: BUSINESS_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
