-- Grannlunch. Kör i Supabase SQL editor.
-- TODO inför nästa steg: messages (name, email nullable, message, created_at)
-- med insert-only för anon, utan select. Prenumeranter ligger kvar i subscribers.
-- Frontend ska bara använda anon-nyckeln.
-- Insert från sidan är öppen med flit i den här versionen.
-- Turnstile och en Edge Function kan läggas framför senare.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lunch_status') then
    create type public.lunch_status as enum ('draft', 'published', 'completed', 'cancelled');
  end if;
end $$;

create table if not exists public.lunches (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date not null,
  meeting_time time not null,
  lunch_time time not null,
  restaurant_name text not null,
  restaurant_address text not null,
  restaurant_url text,
  meeting_point text not null,
  description text not null default '',
  offer_text text,
  max_participants integer,
  status public.lunch_status not null default 'draft',
  created_at timestamptz not null default now(),
  constraint lunches_max_participants_positive
    check (max_participants is null or max_participants > 0)
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'registration_status') then
    create type public.registration_status as enum ('registered', 'cancelled');
  end if;
end $$;

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  lunch_id uuid not null references public.lunches (id) on delete cascade,
  name text not null,
  email text not null,
  joining_walk boolean not null default true,
  future_updates boolean not null default false,
  status public.registration_status not null default 'registered',
  created_at timestamptz not null default now(),
  constraint registrations_name_length check (char_length(btrim(name)) between 2 and 80),
  constraint registrations_email_format check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

-- En rad per e-post och lunch. En avbokning behåller raden och byter status.
-- TODO inför Supabase: en person som redan är cancelled kan inte anmäla sig igen
-- via formuläret, eftersom insert då krockar med den här nyckeln. Admin sätter
-- status tillbaka till registered. Skapa ingen update-policy för anon.
create unique index if not exists registrations_lunch_email_unique
  on public.registrations (lunch_id, lower(email));

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint subscribers_email_format check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

create unique index if not exists subscribers_email_unique
  on public.subscribers (lower(email));

create index if not exists lunches_published_date_idx
  on public.lunches (date)
  where status = 'published';

-- Bara lunch och antal aktiva anmälningar. Inga namn eller e-postadresser.
-- security_invoker false gör att vyn kan räkna utan att lämna ut raderna.
-- Avbokade rader (status = cancelled) räknas inte.
create or replace view public.lunch_registration_counts
with (security_invoker = false) as
select
  r.lunch_id,
  count(*)::integer as registered_count
from public.registrations r
join public.lunches l on l.id = r.lunch_id
where l.status = 'published'
  and r.status = 'registered'
group by r.lunch_id;

alter table public.lunches enable row level security;
alter table public.registrations enable row level security;
alter table public.subscribers enable row level security;

revoke all on public.registrations from anon, authenticated;
revoke all on public.subscribers from anon, authenticated;

grant select on public.lunches to anon, authenticated;
grant select on public.lunch_registration_counts to anon, authenticated;
grant insert on public.registrations to anon, authenticated;
grant insert on public.subscribers to anon, authenticated;

drop policy if exists "published lunches are readable" on public.lunches;
create policy "published lunches are readable"
  on public.lunches
  for select
  to anon, authenticated
  using (status = 'published');

-- Anon får skapa en anmälan, inte ändra den. Status sätts till registered.
-- Admin ändrar senare status till cancelled i Dashboard. Ingen update-policy för anon.
drop policy if exists "anyone can register" on public.registrations;
create policy "anyone can register"
  on public.registrations
  for insert
  to anon, authenticated
  with check (
    status = 'registered'
    and exists (
      select 1
      from public.lunches
      where lunches.id = lunch_id
        and lunches.status = 'published'
    )
  );

drop policy if exists "anyone can subscribe" on public.subscribers;
create policy "anyone can subscribe"
  on public.subscribers
  for insert
  to anon, authenticated
  with check (true);

insert into public.lunches (
  id,
  title,
  date,
  meeting_time,
  lunch_time,
  restaurant_name,
  restaurant_address,
  meeting_point,
  description,
  offer_text,
  max_participants,
  status
) values (
  '00000000-0000-4000-8000-000000000001',
  'Grannlunch',
  '2026-10-14',
  '11:45',
  '12:05',
  'Exempelrestaurang',
  'Åkersberga Centrum',
  'Gemensam promenad från området.',
  'En promenad och lunch tillsammans.',
  'Vi siktar på ett bra pris',
  19,
  'published'
)
on conflict (id) do nothing;
