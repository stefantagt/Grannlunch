import type { Lunch } from "./types";

/** Tillfällig exempel-lunch tills sidan läser från Supabase. */
export const nextLunch: Lunch = {
  id: "lunch-2026-10-14",
  title: "Grannlunch",
  date: "2026-10-14",
  meetingTime: "11:45",
  lunchTime: "12:05",
  restaurantName: "Exempelrestaurang",
  restaurantAddress: "Åkersberga Centrum",
  restaurantUrl: null,
  meetingPoint: "Gemensam promenad från området.",
  description: "En promenad och lunch tillsammans.",
  offerText: "Vi siktar på ett bra pris",
  maxParticipants: 19,
  registeredCount: 7,
  status: "published",
  createdAt: "2026-09-20T08:00:00.000Z",
};
