# Store R1 Foundation

## Decision

The existing Asri repository is the implementation repository for the online store. The existing Duitku + Supabase payment backend remains intact and is treated as an integration boundary.

## Current architecture

- Mobile-only React frontend with a 500px maximum content width.
- Frontend communicates with backend only through Supabase Edge Functions.
- Asri uses custom `public.users` identity with `phone + password`; Supabase Auth/JWT is not part of the application authentication contract.
- Duitku credentials and payment state remain backend-owned.

## R1 scope

- Mobile-first frontend foundation.
- Frontend content width target: 500px.
- Clear separation between frontend and Supabase backend.
- Payment implementation is not duplicated in the frontend.
- Product, cart, checkout, order, and payment business modules are deferred to the next store-contract phases.

## Target structure

frontend/
  src/
    app/
    components/
    pages/
    services/
    stores/
    hooks/
    types/
    utils/
    styles/

supabase/
  functions/
  migrations/

## Verified foundation

1. Frontend build is covered by GitHub Actions.
2. Duitku payment endpoints are implemented behind the Edge Function boundary.
3. Custom payment identity uses `phone + password` and resolves to `public.users.user_id`.
4. Payment tables use RLS and are not exposed to browser business logic.
5. Provider signatures, amount validation, provider reference persistence, and monotonic paid state are implemented.

## Open verification gates

1. Live Duitku Sandbox HTTP tests.
2. Real callback delivery and idempotency verification.
3. Production merchant website/contact information.
4. Frontend dependency lockfile and reproducible install verification.

## Recommended implementation order

1. Complete payment hardening and Sandbox E2E verification.
2. Design Store/Catalog database contract.
3. Design Store backend API contract.
4. Implement product browsing.
5. Implement cart.
6. Implement checkout and order creation.
7. Connect the existing Duitku payment boundary.
8. Order/payment reconciliation and admin operations.
9. Security, testing, and production verification.

## Verification gate

The store foundation is complete only when frontend build/install is reproducible, source boundaries are explicit, payment secrets remain backend-owned, and the payment Sandbox E2E flow is verified.
