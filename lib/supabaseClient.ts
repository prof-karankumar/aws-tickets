import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kjqocjfxazfncxtwxkho.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_N9fZ4ImXyzB55EDo-DHD9Q_h-FRgOAa";

export const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const EVENTS_TABLE = "events";

export interface EventItem {
  id: string;
  event_name?: string | null;
  event_mapping_id?: string | null;
  venue_name?: string | null;
  event_id?: string | null;
  event_start_time?: string | null;
  transfer_date?: string | null;
  list_cost_percentage?: number | null;
  event_status?: string | null;
  event_url?: string | null;
  event_image_url?: string | null;
  created_at?: string | null;
}

export type NewEventInput = Omit<EventItem, 'id' | 'created_at'>;

export async function getAllEventsFromDB(): Promise<EventItem[]> {
  const { data, error } = await supabaseClient
    .from(EVENTS_TABLE)
    .select("*");

  if (error) {
    console.error("Failed to load events:", error.message);
    throw error;
  }

  return data || [];
}

export async function getEventByIdFromDB(id: string): Promise<EventItem | null> {
  const { data, error } = await supabaseClient
    .from(EVENTS_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load event:", error.message);
    throw error;
  }

  return data;
}

export async function addEventToDB(eventData: NewEventInput): Promise<EventItem> {
  const { data, error } = await supabaseClient
    .from(EVENTS_TABLE)
    .insert([eventData])
    .select()
    .single();

  if (error) {
    console.error("Failed to add event:", error.message);
    throw error;
  }

  return data;
}

export async function updateEventInDB(id: string, updates: Partial<EventItem>): Promise<EventItem> {
  const { data, error } = await supabaseClient
    .from(EVENTS_TABLE)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update event:", error.message);
    throw error;
  }

  return data;
}

export async function deleteEventFromDB(id: string): Promise<boolean> {
  const { error } = await supabaseClient
    .from(EVENTS_TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Failed to delete event:", error.message);
    throw error;
  }

  return true;
}

export async function updateAllEventsStatusInDB(status: string): Promise<boolean> {
  const { error } = await supabaseClient
    .from(EVENTS_TABLE)
    .update({ event_status: status })
    .not("id", "is", null);

  if (error) {
    console.error("Failed to bulk update events:", error.message);
    throw error;
  }

  return true;
}
