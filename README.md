# Asri — Duitku + Supabase Payment Integration

## V1

Backend foundation for Duitku Payment Gateway + Supabase PostgreSQL + Supabase Edge Functions.

### Architecture

```
Frontend
  -> Supabase Edge Function
  -> Duitku
  -> Duitku callback
  -> Supabase Edge Function
  -> Supabase PostgreSQL
```

### Core rules

- Duitku credentials stay server-side.
- Frontend never controls authoritative payment status.
- Callback signatures must be verified.
- Callback processing must be idempotent.
- Payment state is persisted in PostgreSQL.
- RLS protects client-facing data.
- Provider transaction status may be used for reconciliation/verification.
- No secrets are committed to Git.

### V1 scope

1. Payment order persistence.
2. Duitku server-side integration boundary.
3. Callback receiver.
4. Signature verification boundary.
5. Idempotent payment-state transition.
6. Callback audit trail.
7. Supabase RLS foundation.

### Project structure

```
asri/
├── README.md
├── docs/
│   ├── architecture.md
│   └── duitku-supabase.md
└── supabase/
    ├── migrations/
    │   └── 0001_payment_core.sql
    └── functions/
        └── duitku/
            └── index.ts
```

### Source of truth

Duitku:
- https://docs.duitku.com/api/id/
- https://docs.duitku.com/payment-gateway/

Supabase:
- https://supabase.com/docs/guides/database/overview
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/functions
- https://supabase.com/docs/guides/functions/secrets
- https://supabase.com/docs/guides/deployment/database-migrations

### Status

V1 foundation saved. Provider-specific request/response fields and production behavior must be verified against the current official Duitku documentation before production deployment.
