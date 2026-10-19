-- ==============================================================================
-- LunaFlow: Women's Health & Cycle Maintenance Platform
-- Migration: 20261019000000_initial_schema.sql
-- Description: Core tables, constraints, indexes and strict Row Level Security
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Linked with auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text default 'Luna',
  birth_year int check (birth_year >= 1900 and birth_year <= extract(year from now())),
  avg_cycle_length int default 28 check (avg_cycle_length >= 15 and avg_cycle_length <= 65),
  avg_period_length int default 5 check (avg_period_length >= 1 and avg_period_length <= 15),
  is_cycle_regular boolean default true,
  last_period_date date,
  privacy_pin text,
  theme text default 'light' check (theme in ('light', 'dark', 'oled', 'system')),
  language text default 'en' check (language in ('en', 'hi', 'mr')),
  notifications_enabled boolean default true,
  quiet_hours_start time default '22:00',
  quiet_hours_end time default '08:00',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. Cycles Table (Recorded actual menstrual periods)
create table if not exists public.cycles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  period_start_date date not null,
  period_end_date date,
  cycle_length int check (cycle_length is null or (cycle_length >= 15 and cycle_length <= 65)),
  is_predicted boolean default false,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  constraint valid_dates check (period_end_date is null or period_end_date >= period_start_date)
);

create index if not exists idx_cycles_user_start on public.cycles(user_id, period_start_date desc);

-- 3. Daily Logs Table (Single record per user per calendar day)
create table if not exists public.daily_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  log_date date not null,
  flow_intensity text default 'none' check (flow_intensity in ('none', 'spotting', 'light', 'medium', 'heavy')),
  symptoms text[] default '{}',
  moods text[] default '{}',
  cervical_mucus text,
  water_glasses int default 0 check (water_glasses >= 0 and water_glasses <= 30),
  sleep_hours numeric(3,1) default 7.5 check (sleep_hours >= 0 and sleep_hours <= 24),
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique(user_id, log_date)
);

create index if not exists idx_daily_logs_user_date on public.daily_logs(user_id, log_date desc);

-- 4. Sanitary Inventory Table
create table if not exists public.sanitary_inventory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_type text not null,
  brand_name text,
  remaining_count int default 10 check (remaining_count >= 0),
  reorder_threshold int default 3 check (reorder_threshold >= 0),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_inventory_user on public.sanitary_inventory(user_id);

-- 5. Sanitary Usage Logs Table
create table if not exists public.sanitary_usage_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  item_id uuid references public.sanitary_inventory(id) on delete set null,
  item_type text not null,
  quantity int default 1 check (quantity > 0),
  used_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_usage_user_time on public.sanitary_usage_logs(user_id, used_at desc);

-- 6. Reminders Table
create table if not exists public.reminders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  reminder_type text not null check (reminder_type in ('period_upcoming', 'sanitary_change', 'hydration', 'medication', 'custom')),
  title text not null,
  time_of_day time not null,
  enabled boolean default true,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_reminders_user on public.reminders(user_id);

-- 7. Educational Wellness Content (Publicly readable, admin editable)
create table if not exists public.wellness_content (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category text not null,
  phase_tag text,
  summary text not null,
  content text not null,
  is_published boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict user-ownership isolation: auth.uid() = user_id
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.cycles enable row level security;
alter table public.daily_logs enable row level security;
alter table public.sanitary_inventory enable row level security;
alter table public.sanitary_usage_logs enable row level security;
alter table public.reminders enable row level security;
alter table public.wellness_content enable row level security;

-- Profiles Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can delete own profile" on public.profiles
  for delete using (auth.uid() = id);

-- Cycles Policies
create policy "Users can view own cycles" on public.cycles
  for select using (auth.uid() = user_id);

create policy "Users can insert own cycles" on public.cycles
  for insert with check (auth.uid() = user_id);

create policy "Users can update own cycles" on public.cycles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own cycles" on public.cycles
  for delete using (auth.uid() = user_id);

-- Daily Logs Policies
create policy "Users can view own daily_logs" on public.daily_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert own daily_logs" on public.daily_logs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own daily_logs" on public.daily_logs
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own daily_logs" on public.daily_logs
  for delete using (auth.uid() = user_id);

-- Sanitary Inventory Policies
create policy "Users can view own inventory" on public.sanitary_inventory
  for select using (auth.uid() = user_id);

create policy "Users can insert own inventory" on public.sanitary_inventory
  for insert with check (auth.uid() = user_id);

create policy "Users can update own inventory" on public.sanitary_inventory
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own inventory" on public.sanitary_inventory
  for delete using (auth.uid() = user_id);

-- Sanitary Usage Logs Policies
create policy "Users can view own usage logs" on public.sanitary_usage_logs
  for select using (auth.uid() = user_id);

create policy "Users can insert own usage logs" on public.sanitary_usage_logs
  for insert with check (auth.uid() = user_id);

-- Reminders Policies
create policy "Users can view own reminders" on public.reminders
  for select using (auth.uid() = user_id);

create policy "Users can insert own reminders" on public.reminders
  for insert with check (auth.uid() = user_id);

create policy "Users can update own reminders" on public.reminders
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can delete own reminders" on public.reminders
  for delete using (auth.uid() = user_id);

-- Wellness Content Policy (Public Read)
create policy "Allow public read on published wellness content" on public.wellness_content
  for select using (is_published = true);
