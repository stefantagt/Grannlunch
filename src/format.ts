import type { Lunch } from "./types";

export function formatLunchDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const formatted = new Intl.DateTimeFormat("sv-SE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  return formatted.charAt(0).toLocaleUpperCase("sv-SE") + formatted.slice(1);
}

export function attendanceLabel(count: number): string {
  if (count === 0) return "Ingen är anmäld än";
  if (count === 1) return "1 granne är redan anmäld";
  return `${count} grannar är redan anmälda`;
}

export function spotsLeft(lunch: Lunch, registeredCount: number): number | null {
  if (lunch.maxParticipants == null) return null;
  return Math.max(lunch.maxParticipants - registeredCount, 0);
}

export function spotsLabel(spots: number): string {
  if (spots === 0) return "Inga platser kvar";
  if (spots === 1) return "1 plats kvar";
  return `${spots} platser kvar`;
}

export function placeLabel(lunch: Lunch): string {
  return `${lunch.restaurantName}, ${lunch.restaurantAddress}`;
}
