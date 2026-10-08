# R3.2 Payment Identity Contract Verification

## Static checks

- [ ] Duitku Edge Function contains no Supabase Auth `getUser` call
- [ ] `/create` verifies `phone + password`
- [ ] `/payment-methods` verifies `phone + password`
- [ ] `/status` verifies `phone + password`
- [ ] `/status` verifies `payment_orders.user_id` ownership
- [ ] `/callback` remains public
- [ ] callback signature validation remains unchanged
- [ ] payment secrets remain server-side
- [ ] frontend payment service calls the Duitku Edge Function only
- [ ] `payment_orders.user_id` references `public.users.user_id`
- [ ] no browser payment policy uses `auth.uid()`

## Runtime checks

Require a deployed Edge Function and test credentials/data:

1. Valid custom credentials can create a payment order.
2. Invalid credentials are rejected.
3. A user cannot read another user's payment status.
4. A user can read their own payment status.
5. Duitku callback remains callable without user credentials.
6. A valid callback updates the matching payment order.
7. An invalid callback signature is rejected.
