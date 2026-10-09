-- Backend V1 corrections: callback deduplication and payment status audit
-- Additive migration; preserves existing V2 tables and data.

alter table public.payment_callbacks
  add column if not exists event_fingerprint text;

create unique index if not exists payment_callbacks_provider_fingerprint_uidx
  on public.payment_callbacks(provider, event_fingerprint)
  where event_fingerprint is not null;

-- A payment order represents one payment attempt. Repeated callbacks/status
-- checks must update the same provider transaction rather than insert duplicates.
create unique index if not exists payment_transactions_order_provider_uidx
  on public.payment_transactions(order_id, provider);

create table if not exists public.payment_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.payment_orders(id) on delete restrict,
  previous_status text,
  new_status text not null,
  source text not null default 'database_trigger',
  created_at timestamptz not null default now()
);

create index if not exists payment_status_history_order_created_idx
  on public.payment_status_history(order_id, created_at desc);

alter table public.payment_status_history enable row level security;
revoke all on public.payment_status_history from anon, authenticated;

create or replace function public.log_payment_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status is distinct from new.status then
    insert into public.payment_status_history (
      order_id, previous_status, new_status, source
    ) values (
      new.id, old.status, new.status, 'database_trigger'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists payment_order_status_history_trigger
  on public.payment_orders;

create trigger payment_order_status_history_trigger
after update of status on public.payment_orders
for each row
execute function public.log_payment_order_status_change();
