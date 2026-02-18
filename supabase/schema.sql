create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer', 'business')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.queues (
  id text primary key,
  host_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  location text,
  time_per_person integer not null default 5,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.queue_members (
  id uuid primary key default gen_random_uuid(),
  queue_id text not null references public.queues(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  contact_info text,
  status text not null default 'waiting' check (status in ('waiting', 'served', 'removed', 'left', 'closed')),
  joined_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists queue_members_unique_waiting_user
  on public.queue_members (queue_id, user_id)
  where status = 'waiting';

create index if not exists queue_members_queue_waiting_joined_at_idx
  on public.queue_members (queue_id, status, joined_at);

alter table public.profiles enable row level security;
alter table public.queues enable row level security;
alter table public.queue_members enable row level security;

drop policy if exists "profiles_read_self" on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;

drop policy if exists "queues_read_authenticated" on public.queues;
drop policy if exists "queues_insert_host" on public.queues;
drop policy if exists "queues_update_host" on public.queues;

drop policy if exists "queue_members_read_authenticated" on public.queue_members;
drop policy if exists "queue_members_insert_self" on public.queue_members;
drop policy if exists "queue_members_update_self_or_host" on public.queue_members;

create policy "profiles_read_self"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "profiles_insert_self"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "profiles_update_self"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "queues_read_authenticated"
  on public.queues
  for select
  to authenticated
  using (true);

create policy "queues_insert_host"
  on public.queues
  for insert
  to authenticated
  with check (auth.uid() = host_user_id);

create policy "queues_update_host"
  on public.queues
  for update
  to authenticated
  using (auth.uid() = host_user_id)
  with check (auth.uid() = host_user_id);

create policy "queue_members_read_authenticated"
  on public.queue_members
  for select
  to authenticated
  using (true);

create policy "queue_members_insert_self"
  on public.queue_members
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "queue_members_update_self_or_host"
  on public.queue_members
  for update
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.queues q
      where q.id = queue_members.queue_id
      and q.host_user_id = auth.uid()
    )
  )
  with check (
    auth.uid() = user_id
    or exists (
      select 1 from public.queues q
      where q.id = queue_members.queue_id
      and q.host_user_id = auth.uid()
    )
  );
