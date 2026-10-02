-- Grannlunch v1. Kör i Supabase SQL editor i ett nytt projekt.
-- Frontend får bara använda anon-nyckeln. RLS är säkerhetsgränsen.
-- Varje lunchtillfälle är en ny rad. Skriv inte över en gammal lunch.
-- Gamla luncher och anmälningar ligger kvar. Avbokning ändrar status, raderar inte raden.
-- create table if not exists ändrar inte en tabell som redan finns.
-- CAPTCHA, rate limit och Edge Function är senare steg om spam blir ett problem.
-- Formulären har ett honeypot-fält i v1. Det är inte en säkerhetsgräns.

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
  updated_at timestamptz not null default now(),
  constraint lunches_max_participants_positive
    check (max_participants is null or max_participants > 0)
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'registration_status') then
    create type public.registration_status as enum ('registered', 'cancelled');
  end if;
end $$;

-- lunch_id pekar på ett specifikt tillfälle. restrict skyddar historiken:
-- en lunch med anmälningar kan inte raderas och ta raderna med sig.
create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  lunch_id uuid not null,
  name text not null,
  email text not null,
  joining_walk boolean not null default true,
  future_updates boolean not null default false,
  status public.registration_status not null default 'registered',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registrations_lunch_id_fkey
    foreign key (lunch_id) references public.lunches (id) on delete restrict,
  constraint registrations_name_length check (
    char_length(name) between 2 and 80
    and name = btrim(name)
  ),
  constraint registrations_email_normalized check (
    char_length(email) between 3 and 254
    and email = lower(email)
    and email = btrim(email)
    and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  )
);

-- En e-post per lunch, inte globalt. Samma adress får finnas på Lunch A och Lunch B.
-- En cancelled rad ligger kvar, så samma adress kan inte anmälas igen förrän
-- admin sätter status tillbaka till registered. Ingen update-policy för anon.
create unique index if not exists registrations_lunch_email_unique
  on public.registrations (lunch_id, lower(email));

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscribers_email_normalized check (
    char_length(email) between 3 and 254
    and email = lower(email)
    and email = btrim(email)
    and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  )
);

create unique index if not exists subscribers_email_unique
  on public.subscribers (lower(email));

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  message text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint messages_name_length check (
    char_length(name) between 2 and 80
    and name = btrim(name)
  ),
  constraint messages_message_length check (
    char_length(message) between 1 and 2000
    and message = btrim(message)
  ),
  constraint messages_email_normalized check (
    email is null
    or (
      char_length(email) between 3 and 254
      and email = lower(email)
      and email = btrim(email)
      and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    )
  )
);

alter table public.lunches add column if not exists updated_at timestamptz not null default now();
alter table public.registrations add column if not exists updated_at timestamptz not null default now();
alter table public.subscribers add column if not exists updated_at timestamptz not null default now();
alter table public.messages add column if not exists updated_at timestamptz not null default now();

-- Sätter updated_at när en rad ändras, till exempel när en anmälan avbokas.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public, anon, authenticated;

drop trigger if exists lunches_set_updated_at on public.lunches;
create trigger lunches_set_updated_at
  before update on public.lunches
  for each row execute function public.set_updated_at();

drop trigger if exists registrations_set_updated_at on public.registrations;
create trigger registrations_set_updated_at
  before update on public.registrations
  for each row execute function public.set_updated_at();

drop trigger if exists subscribers_set_updated_at on public.subscribers;
create trigger subscribers_set_updated_at
  before update on public.subscribers
  for each row execute function public.set_updated_at();

drop trigger if exists messages_set_updated_at on public.messages;
create trigger messages_set_updated_at
  before update on public.messages
  for each row execute function public.set_updated_at();

create index if not exists lunches_published_date_idx
  on public.lunches (date)
  where status = 'published';

-- Bara lunch och antal aktiva anmälningar, per lunch_id. Inga namn eller e-postadresser.
-- security_invoker false är avsiktligt: ägaren får räkna rader som anon inte får läsa.
-- Avbokade rader (status = cancelled) räknas inte. Lunch A och Lunch B blandas inte.
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
alter table public.messages enable row level security;

revoke all on public.lunches from public, anon, authenticated;
revoke all on public.registrations from public, anon, authenticated;
revoke all on public.subscribers from public, anon, authenticated;
revoke all on public.messages from public, anon, authenticated;
revoke all on public.lunch_registration_counts from public, anon, authenticated;

grant select on public.lunches to anon, authenticated;
grant select (lunch_id, registered_count) on public.lunch_registration_counts to anon, authenticated;

-- status utelämnas. Default registered används. Anon kan inte skicka in en annan status.
grant insert (lunch_id, name, email, joining_walk, future_updates)
  on public.registrations to anon, authenticated;
grant insert (email) on public.subscribers to anon, authenticated;
grant insert (name, email, message) on public.messages to anon, authenticated;

drop policy if exists "published lunches are readable" on public.lunches;
create policy "published lunches are readable"
  on public.lunches
  for select
  to anon, authenticated
  using (status = 'published');

-- Anon får skapa en anmälan till en publicerad lunch, inte läsa eller ändra den.
-- Admin ändrar status till cancelled i Dashboard.
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
  with check (
    char_length(email) between 3 and 254
    and email = lower(email)
  );

drop policy if exists "anyone can send a message" on public.messages;
create policy "anyone can send a message"
  on public.messages
  for insert
  to anon, authenticated
  with check (
    char_length(name) between 2 and 80
    and char_length(message) between 1 and 2000
    and (email is null or email = lower(email))
  );
