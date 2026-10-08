-- Asri V2: verified Duitku contract + payment lifecycle
-- Source: current official Duitku API reference (API v2, Sep 2026).

alter table public.payment_orders
  add column if not exists product_details text,
  add column if not exists customer_email text,
  add column if not exists customer_phone text,
  add column if not exists customer_va_name text,
  add column if not exists additional_param text,
  add column if not exists merchant_user_info text,
  add column if not exists callback_url text,
  add column if not exists return_url text,
  add column if not exists expiry_period integer,
  add column if not exists provider text not null default 'duitku',
  add column if not exists provider_reference text,
  add column if not exists payment_url text,
  add column if not exists va_number text,
  add column if not exists qr_string text,
  add column if not exists app_url text,
  add column if not exists provider_status_code text,
  add column if not exists provider_status_message text,
  add column if not exists failed_at timestamptz,
  add column if not exists failure_reason text;

alter table public.payment_orders
  drop constraint if exists payment_orders_status_check;

alter table public.payment_orders
  add constraint payment_orders_status_check
  check (status in ('pending', 'paid', 'failed', 'cancelled', 'creation_failed'));

create unique index if not exists payment_orders_provider_reference_uidx
  on public.payment_orders(provider, provider_reference)
  where provider_reference is not null;

alter table public.payment_transactions
  add column if not exists publisher_order_id text,
  add column if not exists payment_method text,
  add column if not exists settlement_date_text text,
  add column if not exists issuer_code text,
  add column if not exists customer_name text,
  add column if not exists raw_response jsonb;

alter table public.payment_callbacks
  add column if not exists payment_code text,
  add column if not exists reference text,
  add column if not exists publisher_order_id text,
  add column if not exists sp_user_hash text,
  add column if not exists settlement_date text,
  add column if not exists issuer_code text,
  add column if not exists customer_name text,
  add column if not exists http_status integer;

create index if not exists payment_transactions_order_id_idx
  on public.payment_transactions(order_id);

create index if not exists payment_transactions_reference_idx
  on public.payment_transactions(provider_reference);

create index if not exists payment_callbacks_reference_idx
  on public.payment_callbacks(reference);

-- Keep callback audit data inaccessible to browser roles.
revoke all on public.payment_callbacks from anon, authenticated;
revoke all on public.payment_transactions from anon, authenticated;

-- No client INSERT/UPDATE/DELETE policies: payment state is backend-owned.
