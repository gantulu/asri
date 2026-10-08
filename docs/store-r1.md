# Store R1 Foundation

## Decision

The existing Asri repository is the implementation repository for the online store. The existing Duitku + Supabase payment backend remains intact and is treated as an integration boundary.

## R1 scope

- Mobile-first frontend foundation.
- Frontend content width target: 500px.
- Clear separation between frontend and Supabase backend.
- Payment implementation is not duplicated in the frontend.
- Product, cart, checkout, order, and payment business modules are deferred to R2+.

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

## Audit findings

1. Repository is healthy and already contains the Duitku V2 payment foundation.
2. Frontend directory was only partially bootstrapped during R1.
3. A frontend package/build toolchain has not yet been committed.
4. No store database schema exists yet for products, carts, orders, or catalog data.
5. Existing payment schema is specialized and should not be replaced by a generic store schema.
6. Existing payment callbacks and provider secrets must remain backend-owned.

## Recommended implementation order

R1: complete frontend foundation.
R2: design store/catalog database contract.
R3: design store backend API contract.
R4: implement product browsing.
R5: implement cart.
R6: implement checkout and order creation.
R7: connect existing Duitku payment boundary.
R8: order/payment reconciliation and admin operations.
R9: security, testing, and production verification.

## Verification gate

R1 is complete only when the frontend has a reproducible install/build configuration, the source tree follows the agreed boundary, and no payment secrets or payment state logic are moved into the browser.
