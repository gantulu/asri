# R3.2 Payment Identity Contract Verification

## Static checks

- [x] Duitku Edge Function contains no Supabase Auth `getUser` call.
- [x] `/create` verifies `phone + password`.
- [x] `/payment-methods` verifies `phone + password`.
- [x] `/status` verifies `phone + password`.
- [x] `/status` verifies `payment_orders.user_id` ownership.
- [x] `/callback` remains public.
- [x] Callback signature validation remains unchanged.
- [x] Payment secrets remain server-side.
- [x] Frontend payment service calls the Duitku Edge Function only.
- [x] `payment_orders.user_id` references `public.users.user_id`.
- [x] No browser payment policy uses `auth.uid()`.

## Runtime checks

Require a deployed Edge Function and test credentials/data:

- [ ] Valid custom credentials can create a payment order.
- [ ] Invalid credentials are rejected.
- [ ] A user cannot access another user's payment status.
- [ ] A user can access their own payment status.
- [ ] Duitku callback remains callable without user credentials.
- [ ] A valid callback updates the matching payment order.
- [ ] An invalid callback signature is rejected.

Runtime checks remain open until the live Sandbox E2E test is executed.
