create table if not exists public.users (
  user_id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  password text not null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

revoke all on public.users from anon, authenticated;
