create extension if not exists pgcrypto;

create table if not exists public.guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 40),
  message text not null check (char_length(btrim(message)) between 1 and 280),
  x double precision not null check (x between 0 and 100),
  y double precision not null check (y between 0 and 100),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists guestbook_entries_approved_created_idx
  on public.guestbook_entries (created_at desc) where status = 'approved';

create table if not exists public.site_counters (
  counter_name text primary key check (counter_name in ('visitors')),
  value bigint not null default 0 check (value >= 0),
  updated_at timestamptz not null default now()
);

insert into public.site_counters (counter_name, value)
values ('visitors', 0)
on conflict (counter_name) do nothing;

create table if not exists public.submission_rate_limits (
  bucket_start timestamptz not null,
  action text not null check (action in ('guestbook', 'contact')),
  ip_fingerprint text not null check (char_length(ip_fingerprint) = 64),
  count integer not null default 0 check (count >= 0),
  primary key (bucket_start, action, ip_fingerprint)
);

alter table public.guestbook_entries enable row level security;
alter table public.site_counters enable row level security;
alter table public.submission_rate_limits enable row level security;
alter table public.guestbook_entries force row level security;
alter table public.site_counters force row level security;
alter table public.submission_rate_limits force row level security;

-- No anon/authenticated policies are intentionally created. Direct Data API
-- reads and writes are denied; the server uses the service role or RPCs below.
revoke all on table public.guestbook_entries, public.site_counters, public.submission_rate_limits from public, anon, authenticated;
grant select, insert on table public.guestbook_entries to service_role;
grant select, update, insert on table public.site_counters to service_role;
grant select, insert, update on table public.submission_rate_limits to service_role;

create or replace view public.approved_guestbook
with (security_invoker = true)
as
  select id, name, message, x, y, created_at
  from public.guestbook_entries
  where status = 'approved';

revoke all on public.approved_guestbook from public, anon, authenticated;
grant select on public.approved_guestbook to service_role;

create or replace function public.increment_site_counter(p_counter_name text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  next_value bigint;
begin
  if p_counter_name <> 'visitors' then
    raise exception 'unsupported counter';
  end if;

  insert into public.site_counters (counter_name, value, updated_at)
  values (p_counter_name, 1, now())
  on conflict (counter_name) do update
    set value = public.site_counters.value + 1,
        updated_at = now()
  returning value into next_value;
  return next_value;
end;
$$;

create or replace function public.consume_submission_rate_limit(
  p_action text,
  p_fingerprint text,
  p_max_count integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
begin
  if p_action not in ('guestbook', 'contact') or p_max_count < 1 or p_max_count > 100 then
    raise exception 'invalid rate-limit arguments';
  end if;

  -- Keep only short-lived anonymous buckets; raw addresses are never stored.
  delete from public.submission_rate_limits
    where bucket_start < now() - interval '48 hours';

  insert into public.submission_rate_limits (bucket_start, action, ip_fingerprint, count)
  values (date_trunc('hour', now()), p_action, p_fingerprint, 1)
  on conflict (bucket_start, action, ip_fingerprint) do update
    set count = least(public.submission_rate_limits.count + 1, p_max_count + 1);
  select rl.count into current_count
    from public.submission_rate_limits as rl
    where rl.bucket_start = date_trunc('hour', now())
      and rl.action = p_action
      and rl.ip_fingerprint = p_fingerprint;
  return current_count <= p_max_count;
end;
$$;

revoke all on function public.increment_site_counter(text) from public, anon, authenticated;
revoke all on function public.consume_submission_rate_limit(text, text, integer) from public, anon, authenticated;
grant execute on function public.increment_site_counter(text) to service_role;
grant execute on function public.consume_submission_rate_limit(text, text, integer) to service_role;
