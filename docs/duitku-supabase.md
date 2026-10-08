# Duitku + Supabase Integration Notes

## Official documentation

Duitku API:
https://docs.duitku.com/api/id/

Duitku Payment Gateway:
https://docs.duitku.com/payment-gateway/

Supabase Database:
https://supabase.com/docs/guides/database/overview

Supabase RLS:
https://supabase.com/docs/guides/database/postgres/row-level-security

Supabase Edge Functions:
https://supabase.com/docs/guides/functions

Supabase Secrets:
https://supabase.com/docs/guides/functions/secrets

Supabase Migrations:
https://supabase.com/docs/guides/deployment/database-migrations

## Secrets

Expected server-side secrets:
- DUITKU_MERCHANT_CODE
- DUITKU_API_KEY
- DUITKU_ENVIRONMENT
- SUPABASE_SERVICE_ROLE_KEY

Do not commit values.

## Signature rule

The exact signature formula must be implemented per Duitku operation. Do not assume one formula applies to every endpoint.

Signature code should be isolated from business logic.

## Payment confirmation

A browser redirect is not authoritative payment confirmation.

Authoritative payment state must come from verified server-side provider communication and/or an explicit provider transaction-status verification flow.

## Environment

Sandbox and production credentials/configuration must remain separate.

## Production gate

Before production:
- verify current inquiry payload;
- verify current callback payload;
- verify callback signature formula;
- verify transaction-status signature formula;
- verify content type;
- verify retry behavior;
- test duplicate callbacks;
- test amount mismatch;
- test invalid signature;
- test unknown order;
- test failed payment;
- test successful payment.
