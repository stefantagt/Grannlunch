import type { Lunch, LunchStatus } from "./types";
import { normalizeEmail } from "./validate";
import { getSupabase, isSupabaseConfigured } from "./lib/supabase";

export type SignupInput = {
  name: string;
  email: string;
  joiningWalk: boolean;
  futureUpdates: boolean;
};

export type SaveResult = { ok: true } | { ok: false; message: string };

type LunchRow = {
  id: string;
  title: string;
  date: string;
  meeting_time: string;
  lunch_time: string;
  restaurant_name: string;
  restaurant_address: string;
  restaurant_url: string | null;
  meeting_point: string;
  description: string;
  offer_text: string | null;
  max_participants: number | null;
  status: LunchStatus;
  created_at: string;
};

const duplicateMessage = "Den här e-postadressen är redan anmäld till lunchen.";
const saveFailedMessage = "Det gick inte att spara just nu. Försök igen.";

export async function getNextLunch(): Promise<
  { lunch: Lunch; registeredCount: number } | null
> {
  if (!isSupabaseConfigured()) return null;

  const today = localDateIso(new Date());
  const { data, error } = await getSupabase()
    .from("lunches")
    .select("*")
    .eq("status", "published")
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as LunchRow;
  const registeredCount = await getRegisteredCount(row.id);
  return { lunch: toLunch(row, registeredCount), registeredCount };
}

export async function registerForLunch(
  lunchId: string,
  input: SignupInput,
): Promise<SaveResult> {
  if (!isSupabaseConfigured()) return { ok: true };

  const email = normalizeEmail(input.email);
  const { error } = await getSupabase().from("registrations").insert({
    lunch_id: lunchId,
    name: input.name.trim(),
    email,
    joining_walk: input.joiningWalk,
    future_updates: input.futureUpdates,
  });

  if (error) {
    if (isDuplicate(error.code)) return { ok: false, message: duplicateMessage };
    return { ok: false, message: saveFailedMessage };
  }

  if (input.futureUpdates) {
    await saveSubscriber(email);
  }

  return { ok: true };
}

export async function subscribeToNextLunch(email: string): Promise<SaveResult> {
  if (!isSupabaseConfigured()) return { ok: true };

  const saved = await saveSubscriber(normalizeEmail(email));
  return saved ? { ok: true } : { ok: false, message: saveFailedMessage };
}

async function saveSubscriber(email: string): Promise<boolean> {
  const { error } = await getSupabase().from("subscribers").insert({ email });
  if (!error || isDuplicate(error.code)) return true;
  return false;
}

async function getRegisteredCount(lunchId: string): Promise<number> {
  const { data, error } = await getSupabase()
    .from("lunch_registration_counts")
    .select("registered_count")
    .eq("lunch_id", lunchId)
    .maybeSingle();

  if (error || !data) return 0;
  return Number(data.registered_count) || 0;
}

function toLunch(row: LunchRow, registeredCount: number): Lunch {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    meetingTime: row.meeting_time.slice(0, 5),
    lunchTime: row.lunch_time.slice(0, 5),
    restaurantName: row.restaurant_name,
    restaurantAddress: row.restaurant_address,
    restaurantUrl: row.restaurant_url,
    meetingPoint: row.meeting_point,
    description: row.description,
    offerText: row.offer_text,
    maxParticipants: row.max_participants,
    registeredCount,
    status: row.status,
    createdAt: row.created_at,
  };
}

function localDateIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function isDuplicate(code: string | undefined): boolean {
  return code === "23505";
}

export type MessageInput = {
  name: string;
  email: string | null;
  message: string;
};

// Replace submitMessage with a Supabase insert into a messages table.
// Columns: name, email (nullable), message. created_at is set by the database.
// This mock must not send the message anywhere.
export async function submitMessage(input: MessageInput): Promise<SaveResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 240));
  void input;
  return { ok: true };
}
