# Asri — Duitku + Supabase Payment Integration

## V2 — verified contract implemented

Asri is the payment backend foundation for **Duitku + Supabase PostgreSQL + Supabase Edge Functions**.

## Audit result

### V1 findings

1. Inquiry endpoint was only a scaffold.
2. Callback verification formula was correct, but provider fields were incomplete.
3. Callback processing was not fully idempotent at transaction/reference level.
4. Transaction-status endpoint was not implemented.
5. Payment-method endpoint was not implemented.
6. Provider response data such as `reference`, `paymentUrl`, `vaNumber`, `qrString`, and `appUrl` was not persisted.
7. RLS was enabled but client read policy had not been defined.
8. The current Duitku documentation uses HMAC-SHA256; legacy MD5/SHA256 signatures are obsolete.

## Verified Duitku V2 contract

Current official documentation confirms:

- Inquiry: `POST /webapi/api/merchant/v2/inquiry`
- Payment method: `POST /webapi/api/merchant/paymentmethod/getpaymentmethod`
- Transaction status: `POST /webapi/api/merchant/transactionStatus`
- Inquiry signature: `HMAC_SHA256(merchantCode + merchantOrderId + paymentAmount, apiKey)`
- Payment-method signature: `HMAC_SHA256(merchantcode + amount + datetime, apiKey)`
- Transaction-status signature: `HMAC_SHA256(merchantCode + merchantOrderId, apiKey)`
- Callback signature: `HMAC_SHA256(merchantcode + amount + merchantOrderId, apiKey)`
- Callback content type: `application/x-www-form-urlencoded`
- Callback result: `00 = Success`, `01 = Failed`
- Transaction status: `00 = Success`, `01 = Pending`, `02 = Canceled`
- Redirect resultCode must not be treated as authoritative payment state.
- Duitku retries a callback when HTTP 200 is not received, up to five attempts.
- Provider reference should be persisted for transaction tracking.

## V2 routes

```
POST /functions/v1/duitku/create
POST /functions/v1/duitku/payment-methods
POST /functions/v1/duitku/status
POST /functions/v1/duitku/callback
```

### Authentication boundary

- `/callback` is public because Duitku must reach it.
- `/create`, `/payment-methods`, and `/status` require a Supabase Auth Bearer token inside the function.
- The Edge Function itself is deployed with JWT gateway verification disabled so the public callback can reach the same function.
- Provider credentials remain server-side.

## V2 database

```
payment_orders
  authoritative merchant order/payment state

payment_transactions
  provider transaction/reference data

payment_callbacks
  immutable-ish callback audit trail
```

Client behavior:

- Client may read its own order when using Supabase Auth and `payment_orders.user_id = auth.uid()`.
- Client cannot insert/update payment state.
- Callback and transaction tables are not exposed to anon/authenticated roles.

## Required Edge Function secrets

Set these in Supabase Edge Function Secrets:

- `DUITKU_MERCHANT_CODE`
- `DUITKU_API_KEY`
- `DUITKU_ENVIRONMENT` = `sandbox` or `production`
- `DUITKU_CALLBACK_URL`
- `DUITKU_RETURN_URL`

Supabase-provided server variables are used for database access.

## Source of truth

Duitku:
https://docs.duitku.com/api/id/
https://docs.duitku.com/payment-gateway/

Supabase:
https://supabase.com/docs/guides/database/overview
https://supabase.com/docs/guides/database/postgres/row-level-security
https://supabase.com/docs/guides/functions
https://supabase.com/docs/guides/functions/secrets
https://supabase.com/docs/guides/deployment/database-migrations

## Verification status

### Completed

- Official Duitku contract re-verified.
- V2 schema committed.
- V2 migration applied to the connected Supabase project.
- V2 Edge Function deployed.
- Edge Function deployment accepted by Supabase.

### Blocked until credentials are configured

- Live sandbox inquiry.
- Live payment-method request.
- Live transaction-status request.
- Real Duitku callback delivery.

No Duitku credentials were present in the repository or supplied during this implementation, so no live payment transaction was fabricated or claimed.

## Next test gate

After sandbox secrets are configured:

1. Create a sandbox order.
2. Verify Duitku returns `statusCode=00`.
3. Verify provider reference and payment instructions are stored.
4. Complete sandbox payment.
5. Verify callback signature.
6. Send the same callback twice and confirm one effective payment state.
7. Verify amount mismatch is rejected.
8. Verify invalid signature is rejected.
9. Verify transaction-status reconciliation.
10. Verify redirect never changes authoritative payment state.


## Backend V1 corrections

See [Backend V1 Corrections](docs/backend-v1-corrections.md).

Additive migration:
- `supabase/migrations/0003_backend_v1_corrections.sql`

Corrections include transaction-status ownership checks, stricter status/amount validation, callback event fingerprinting, payment transaction uniqueness, and payment status history.

**Production blocker:** `/create` currently accepts the amount from the authenticated client. It must be changed to derive the payable amount from a trusted server-side order/cart before production checkout.
