# Payment Architecture

## Trust boundary

Browser input is untrusted. Duitku callback data is untrusted until signature verification succeeds.

## Flow

1. Client requests payment creation.
2. Edge Function validates the order and creates the provider request.
3. Edge Function calls Duitku using server-side credentials.
4. Client receives payment instructions.
5. Customer pays through Duitku.
6. Duitku sends callback to the public Edge Function.
7. Edge Function validates required fields and verifies HMAC.
8. Edge Function validates merchant order and amount.
9. Callback event is persisted.
10. Payment state is updated idempotently.
11. Edge Function returns HTTP 200.

## State

Initial state: pending.

Terminal states in V1:
- paid
- failed
- cancelled

A duplicate callback must not duplicate a transaction or move a finalized paid order backwards.

## Responsibilities

### Frontend
- Start payment.
- Display provider payment instructions.
- Read payment state.
- Never store Duitku API credentials.
- Never mark an order paid.

### Edge Function
- Validate input.
- Generate provider signatures.
- Call Duitku.
- Receive and verify callbacks.
- Apply payment state transitions.
- Access provider secrets.

### PostgreSQL
- Store payment orders.
- Store provider transactions.
- Store callback audit events.
- Enforce constraints and uniqueness.
- Enforce client-facing RLS.

## V1 non-goals

- PPOB fulfillment.
- Refunds.
- Settlement dashboard.
- Fraud engine.
- Provider failover.
