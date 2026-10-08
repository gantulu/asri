-- R3.2: align payment ownership with Asri custom users.
-- No Supabase Auth, JWT, session table, or auth.uid() is used.

create table if not exists public.users (
  user_id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null unique,
  password text not null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

revoke all on public.users from anon, authenticated;

alter table public.payment_orders
  drop constraint if exists payment_orders_user_id_fkey;

alter table public.payment_orders
  add constraint payment_orders_user_id_fkey
  foreign key (user_id) references public.users(user_id)
  on delete restrict;

drop policy if exists payment_orders_select_own on public.payment_orders;

-- Payment ownership and authorization are enforced inside the Duitku Edge Function
-- after verifying phone + password against public.users.
