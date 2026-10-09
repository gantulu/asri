# V2 Test Matrix

## Static/contract checks

- [x] Inquiry endpoint is `/webapi/api/merchant/v2/inquiry`.
- [x] Inquiry uses JSON.
- [x] Inquiry signature is HMAC-SHA256 over merchantCode + merchantOrderId + paymentAmount.
- [x] Payment-method signature is HMAC-SHA256 over merchantcode + amount + datetime.
- [x] Transaction-status signature is HMAC-SHA256 over merchantCode + merchantOrderId.
- [x] Callback accepts x-www-form-urlencoded.
- [x] Callback signature is HMAC-SHA256 over merchantcode + amount + merchantOrderId.
- [x] Redirect resultCode is not used as authoritative payment state.
- [x] Provider amount is checked against the merchant order amount.
- [x] Provider reference is persisted.
- [x] paymentUrl / vaNumber / qrString / appUrl are persisted.
- [x] Duplicate provider reference is protected by a unique index.
- [x] Paid state is monotonic against later failed callbacks.
- [x] Callback is public; application endpoints require Supabase Auth Bearer tokens inside the function.

## Database integration test

Executed against the connected Supabase project in a transaction and rolled back:

- [x] Create pending payment order.
- [x] Insert provider transaction.
- [x] Repeat the same provider reference with upsert.
- [x] Confirm one transaction remains.
- [x] Move pending order to paid.
- [x] Confirm final state is paid.

Observed result:

```
orders = 1
transactions = 1
final_status = paid
```

## Deployment test

- [x] Supabase migration `payment_core` applied.
- [x] Supabase migration `duitku_v2` applied.
- [x] Edge Function `duitku` deployed successfully.
- [x] Edge Function status: ACTIVE.
- [x] Deployment version: 1.

## Live sandbox tests pending

These require real Duitku sandbox credentials:

- [ ] Inquiry against sandbox.
- [ ] Get payment methods against sandbox.
- [ ] Transaction-status against sandbox.
- [ ] Real Duitku callback.
- [ ] Invalid signature callback.
- [ ] Amount mismatch callback.
- [ ] Duplicate callback delivery.
- [ ] Full sandbox payment.


## Backend V1 correction regression checks

- [x] Status check now requires the order to belong to the authenticated user.
- [x] Status check rejects non-2xx provider responses.
- [x] Status check validates amount and documented status codes before updating state.
- [x] Payment-method endpoint propagates provider HTTP status.
- [x] Callback amount is validated as a positive safe integer.
- [x] Callback rejects unsupported result codes.
- [x] Callback processing upserts one transaction per order/provider.
- [x] Callback fingerprint column and unique index added by migration 0003.
- [x] Status history table and database trigger added by migration 0003.
- [ ] Run Deno typecheck / Supabase Edge Function tests.
- [ ] Apply migration 0003 to the target Supabase project.
- [ ] Verify duplicate callback and concurrent callback behavior against the target database.
- [ ] Run all live Sandbox tests.
- [ ] Replace client-provided payment amount with a trusted server-side order amount before production checkout.

These are source-level corrections; unchecked items are not claimed as passed.
