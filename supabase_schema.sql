-- ==============================================================================
-- LunaFlow: Women's Health & Cycle Maintenance PWA - Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/organizations
-- ==============================================================================

-- 1. Profiles Table (Linked with Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text default 'Luna',
  birth_year int,
  avg_cycle_length int default 28,
  avg_period_length int default 5,
  privacy_pin text,
  notifications_enabled boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Cycles & Periods History
create table if not exists public.cycles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  period_start_date date not null,
  period_end_date date,
  cycle_length int default 28,
  is_predicted boolean default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Daily Symptoms & Mood Diary
create table if not exists public.daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  log_date date not null,
  flow_intensity text check (flow_intensity in ('none', 'spotting', 'light', 'medium', 'heavy')),
  symptoms text[],
  moods text[],
  cervical_mucus text,
  water_glasses int default 0,
  sleep_hours numeric(3,1) default 7.5,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, log_date)
);

-- 4. Sanitary Inventory & Usage
create table if not exists public.sanitary_inventory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_type text not null,
  brand_name text,
  remaining_count int default 10,
  reorder_threshold int default 3,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables for complete medical privacy
alter table public.profiles enable row level security;
alter table public.cycles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.sanitary_inventory enable row level security;

-- Strict Policies: Users can ONLY see and update their own personal health data
create policy "Users own profile" on public.profiles for all using (auth.uid() = id);
create policy "Users own cycles" on public.cycles for all using (auth.uid() = user_id);
create policy "Users own daily_logs" on public.daily_logs for all using (auth.uid() = user_id);
create policy "Users own inventory" on public.sanitary_inventory for all using (auth.uid() = user_id);
