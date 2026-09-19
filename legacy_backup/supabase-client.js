// supabase-client.js
// Shared Supabase connection + data helpers for TicketPortal.
//
// IMPORTANT: This file must be loaded AFTER the Supabase CDN script
// (@supabase/supabase-js) and BEFORE the page-specific script
// (script.js / total-events.js / event-details.js).
//
// Only the PUBLIC "anon/publishable" key is used here. That key is
// designed to be visible in browser code — it is safe to ship. The
// secret/service_role key must never be placed in any file like this
// one, since it bypasses Row Level Security entirely.

const SUPABASE_URL = "https://kjqocjfxazfncxtwxkho.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_N9fZ4ImXyzB55EDo-DHD9Q_h-FRgOAa";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const EVENTS_TABLE = "events";

// Fetch every event row.
async function getAllEventsFromDB() {
    const { data, error } = await supabaseClient
        .from(EVENTS_TABLE)
        .select("*");

    if (error) {
        console.error("Failed to load events:", error.message);
        throw error;
    }

    return data || [];
}

// Fetch a single event by its id. Returns null if no row matches.
async function getEventByIdFromDB(id) {
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

// Insert a new event. Returns the inserted row (with its DB-generated id).
async function addEventToDB(eventData) {
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

// Update one event by id with a partial set of fields. Returns the updated row.
async function updateEventInDB(id, updates) {
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

// Delete one event by id.
async function deleteEventFromDB(id) {
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

// Set event_status on every row (used by the "Bulk Actions" menu).
// ".not('id', 'is', null)" is a real filter that simply matches every
// row, since id (the primary key) is never null — Supabase's update()
// requires an explicit filter and will refuse to run without one.
async function updateAllEventsStatusInDB(status) {
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
