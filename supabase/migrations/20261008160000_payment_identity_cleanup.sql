-- R3.2.1: normalize custom-user payment identity migration state.
-- This migration does not change Duitku request, response, signature, callback,
-- status, or payment processing logic.

alter table public.users enable row level security;

revoke all on public.users from anon, authenticated;

alter table public.payment_orders
  drop constraint if exists payment_orders_user_id_fkey;

alter table public.payment_orders
  add constraint payment_orders_user_id_fkey
  foreign key (user_id) references public.users(user_id)
  on delete restrict;

drop policy if exists payment_orders_select_own on public.payment_orders;
