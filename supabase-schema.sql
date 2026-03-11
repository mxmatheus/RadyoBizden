-- ==========================================
-- PROFILES 
-- ==========================================
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text unique,
  role text default 'user'::text,
  favorites jsonb default '[]'::jsonb,
  eq_settings jsonb default '[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Safely add new columns if table already existed (backwards-compatibility)
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN role text default 'user'::text;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN username text unique;
    EXCEPTION
        WHEN duplicate_column THEN null;
    END;
END $$;

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Drop existing policies to avoid already-exists error
drop policy if exists "Users can view their own profile." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update own profile." on profiles;

-- Create policies
create policy "Users can view their own profile."
  on profiles for select
  using ( auth.uid() = id );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Drop the trigger if it already exists to avoid errors on re-runs
drop trigger if exists on_auth_user_created on auth.users;

-- inserts a row into public.profiles
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Set specific user as admin
update public.profiles set role = 'admin' where id = 'e12ead73-834a-4054-956d-9fe24f90c259';

-- ==========================================
-- STATIONS (Master Database)
-- ==========================================
create table if not exists public.stations (
    id uuid default gen_random_uuid() primary key,
    stationuuid text unique not null,
    name text not null,
    url text not null,
    url_resolved text not null,
    homepage text,
    favicon text,
    tags text,
    countrycode text default 'TR',
    codec text default 'MP3',
    bitrate integer default 128,
    is_active boolean default true,
    clickcount integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Safely add clickcount column if table already exists
DO $$
BEGIN
    if exists (select from pg_tables where schemaname = 'public' and tablename = 'stations') then
        if not exists (select from information_schema.columns where table_schema = 'public' and table_name = 'stations' and column_name = 'clickcount') then
            alter table public.stations add column clickcount integer default 0;
        end if;
    end if;
END
$$;

alter table public.stations enable row level security;

drop policy if exists "Public stations are viewable by everyone." on stations;
drop policy if exists "Admins can insert stations." on stations;
drop policy if exists "Admins can update stations." on stations;
drop policy if exists "Admins can delete stations." on stations;

-- Everyone can read stations
create policy "Public stations are viewable by everyone."
  on stations for select
  using ( true );

-- Only admins can insert/update/delete stations
create policy "Admins can insert stations."
  on stations for insert
  with check ( exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create policy "Admins can update stations."
  on stations for update
  using ( exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') );

create policy "Admins can delete stations."
  on stations for delete
  using ( exists(select 1 from public.profiles where id = auth.uid() and role = 'admin') );
