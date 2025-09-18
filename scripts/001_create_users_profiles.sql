-- Create profiles table for user health data
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  weight_kg decimal(5,2),
  height_cm decimal(5,2),
  age integer,
  gender text check (gender in ('male', 'female', 'other')),
  activity_level text check (activity_level in ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
  dietary_restrictions text[], -- array of dietary restrictions
  health_goals text[], -- array of health goals like 'weight_loss', 'muscle_gain', etc.
  allergies text[], -- array of food allergies
  medical_conditions text[], -- array of medical conditions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create food_scans table to store scan history
create table if not exists public.food_scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_name text not null,
  scan_type text not null check (scan_type in ('camera', 'barcode', 'search')),
  image_url text, -- for camera scans
  barcode text, -- for barcode scans
  nutritional_data jsonb, -- store nutritional information
  recommendation jsonb, -- store AI recommendation
  is_recommended boolean, -- quick access to recommendation result
  scanned_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for food_scans
alter table public.food_scans enable row level security;

-- Create policies for food_scans
create policy "food_scans_select_own"
  on public.food_scans for select
  using (auth.uid() = user_id);

create policy "food_scans_insert_own"
  on public.food_scans for insert
  with check (auth.uid() = user_id);

create policy "food_scans_update_own"
  on public.food_scans for update
  using (auth.uid() = user_id);

create policy "food_scans_delete_own"
  on public.food_scans for delete
  using (auth.uid() = user_id);

-- Create function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Create trigger for profiles updated_at
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();
