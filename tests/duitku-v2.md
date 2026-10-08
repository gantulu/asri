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
