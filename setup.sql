-- Run this once in your Supabase project's SQL Editor:
-- https://supabase.com/dashboard/project/kjqocjfxazfncxtwxkho/sql/new

create extension if not exists pgcrypto;

create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),
    event_name text,
    event_mapping_id text,
    venue_name text,
    event_id text,
    event_start_time timestamp,
    transfer_date date,
    list_cost_percentage numeric,
    event_status text default 'Unbroadcasted',
    event_url text,
    event_image_url text,
    created_at timestamptz not null default now()
);

alter table public.events enable row level security;

-- NOTE: This app doesn't use real Supabase Auth (its "login" is just a
-- hardcoded check inside script.js), so these policies allow anyone who
-- has your publishable/anon key to read and write this table. That's
-- no weaker than the app's current "security", but if you ever want
-- this locked down properly, swap these for policies that check
-- auth.uid() once you add real Supabase Auth.

create policy "Public read access"
    on public.events for select
    using (true);

create policy "Public insert access"
    on public.events for insert
    with check (true);

create policy "Public update access"
    on public.events for update
    using (true)
    with check (true);

create policy "Public delete access"
    on public.events for delete
    using (true);
