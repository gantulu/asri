# Asri Store Frontend

Mobile-only React + TypeScript + Vite foundation for Asri Collection.

## V2 foundation

- React + Vite + TypeScript
- React Router
- Zustand dependency
- Tailwind CSS
- Maximum app width: 500px
- Header + primary scroll region + BottomNav shell
- Safe-area support
- Mobile viewport and zoom restrictions
- Required V2 routes
- Contract-safe placeholders where backend contracts do not yet exist

## Backend boundary

The frontend must use an API/service boundary for backend access. It must not access Supabase/PostgreSQL directly.

Product, cart, checkout, order, tracking, and store-auth APIs are not implemented until their verified Edge Function contracts exist.

Existing Duitku payment backend remains under `supabase/` and is not duplicated in the frontend.

## Environment

Public frontend configuration may use `VITE_*` variables only. Private credentials must remain server-side.

## Verification

A successful GitHub CI build is required before this foundation is considered runtime-verified.
