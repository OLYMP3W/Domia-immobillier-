-- 1) Public profiles table (safe fields only)
create table if not exists public.public_profiles (
  user_id uuid primary key,
  fullname text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.public_profiles enable row level security;

-- Anyone can read safe public profiles (no email/phone)
create policy "Public profiles are viewable by anyone"
on public.public_profiles
for select
using (true);

-- Owners can manage their own public profile row (optional; trigger also keeps it in sync)
create policy "Users can insert their own public profile"
on public.public_profiles
for insert
with check (auth.uid() = user_id);

create policy "Users can update their own public profile"
on public.public_profiles
for update
using (auth.uid() = user_id);

-- 2) updated_at helper (used by other tables too)
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_public_profiles_updated_at on public.public_profiles;
create trigger update_public_profiles_updated_at
before update on public.public_profiles
for each row execute function public.update_updated_at_column();

-- 3) Backfill from existing private profiles
insert into public.public_profiles (user_id, fullname, avatar_url, created_at, updated_at)
select user_id, fullname, avatar_url, created_at, updated_at
from public.profiles
on conflict (user_id) do update
set fullname = excluded.fullname,
    avatar_url = excluded.avatar_url,
    updated_at = now();

-- 4) Keep public_profiles in sync when private profile changes
create or replace function public.sync_public_profile_from_private_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.public_profiles (user_id, fullname, avatar_url, created_at, updated_at)
  values (
    new.user_id,
    new.fullname,
    new.avatar_url,
    coalesce(new.created_at, now()),
    coalesce(new.updated_at, now())
  )
  on conflict (user_id) do update
  set fullname = excluded.fullname,
      avatar_url = excluded.avatar_url,
      updated_at = now();

  return new;
end;
$$;

drop trigger if exists sync_public_profile_from_profiles on public.profiles;
create trigger sync_public_profile_from_profiles
after insert or update of fullname, avatar_url on public.profiles
for each row execute function public.sync_public_profile_from_private_profile();

-- 5) Lock down private profiles (email/phone) so they are NOT publicly readable
alter table public.profiles enable row level security;

drop policy if exists "Users can view all profiles" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = user_id);
