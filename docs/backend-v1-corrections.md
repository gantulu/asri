# Backend V1 Corrections — Audit & Verification

## Scope

This change is additive to the existing Asri Duitku V2 foundation. It does not delete or replace existing payment tables or routes.

## Applied corrections

- Added `payment_status_history` to audit payment-order status transitions through a database trigger.
- Added callback `event_fingerprint` and a unique index per provider to identify repeated callback payloads.
- Added a unique constraint on `payment_transactions(order_id, provider)` so repeated callback/status processing upserts the same transaction row.
- Restricted transaction-status checks to the authenticated user's own payment order before calling Duitku.
- Propagated Duitku payment-method HTTP status and response body rather than always returning HTTP 200 with a nested wrapper.
- Validated transaction-status HTTP success, amount equality, and documented status codes before updating local state.
- Rejected callback result codes outside the documented `00` (success) and `01` (failed) values.
- Validated callback amount as a positive safe integer and used it consistently for persistence.
- Added error handling for transaction upsert failures.

## Edge Function structure

Four dedicated Backend V1 functions have been added:

- `duitku-create-payment` — authenticated payment creation.
- `duitku-callback` — public callback endpoint; signature validation is enforced in the handler.
- `duitku-check-status` — authenticated status check, scoped to the caller's own payment order.
- `payment-status` — authenticated read-only payment status.

The existing `duitku` function remains as a compatibility endpoint so existing URLs are not removed. The legacy endpoint also retains the payment-method route. New frontend integrations should use the dedicated functions. JWT settings are recorded in `supabase/config.toml`; the callback is the only dedicated endpoint configured without gateway JWT verification.

## Production blocker

The current `create` route accepts `paymentAmount` from the authenticated client and creates the payment order from that input. Authentication alone does not make the amount authoritative. Before production checkout is connected, the create route must derive the amount from a server-created order/cart or another trusted server-side pricing source. The current store schema does not yet provide that source, so this remains a NO-GO item for production checkout.

## Verification status

- Static source patch applied on branch `backend-v1-corrections`.
- Migration file added but not applied to a Supabase project by this repository change.
- Live Duitku Sandbox tests remain blocked until valid Sandbox secrets are configured.
- No Production deployment was performed.
- Do not mark the payment integration production-ready until the production blocker and live Sandbox test matrix are resolved.
