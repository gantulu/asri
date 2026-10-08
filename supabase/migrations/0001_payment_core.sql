create extension if not exists pgcrypto;

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  merchant_order_id text not null unique,
  user_id uuid null,
  amount bigint not null check (amount > 0),
  currency text not null default 'IDR',
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'failed', 'cancelled')),
  payment_method text null,
  expires_at timestamptz null,
  paid_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.payment_orders(id) on delete restrict,
  provider text not null default 'duitku',
  provider_reference text null,
  payment_code text null,
  amount bigint not null check (amount > 0),
  fee bigint null,
  status_code text null,
  status_message text null,
  settlement_date timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_reference)
);

create table if not exists public.payment_callbacks (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'duitku',
  merchant_order_id text not null,
  signature text null,
  signature_valid boolean not null default false,
  result_code text null,
  payload jsonb not null,
  processing_status text not null default 'received'
    check (processing_status in ('received', 'processed', 'rejected', 'error')),
  received_at timestamptz not null default now(),
  processed_at timestamptz null
);

create index if not exists payment_orders_user_id_idx
  on public.payment_orders(user_id);

create index if not exists payment_orders_status_idx
  on public.payment_orders(status);

create index if not exists payment_callbacks_order_idx
  on public.payment_callbacks(merchant_order_id);

alter table public.payment_orders enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.payment_callbacks enable row level security;

-- Client policies are intentionally added only after the application
-- authentication model is finalized.
