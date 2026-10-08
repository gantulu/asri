# Asri Store Frontend

Mobile-only React + TypeScript + Vite foundation for Asri Collection.

## V2 foundation

- React + Vite + TypeScript
- React Router
- Zustand
- Tailwind CSS
- Maximum app width: 500px
- Header + primary scroll region + BottomNav shell
- Safe-area support
- Mobile viewport and zoom restrictions
- Required V2 routes
- Contract-safe placeholders where backend contracts do not yet exist

## Custom authentication

Asri uses a custom user table and Supabase Edge Function. It does not use Supabase Auth or a sessions table.

Register:
- `name`
- `phone`
- `password`

Login:
- `phone`
- `password`

Successful registration and login persist `name`, `phone`, and `password` in `localStorage.asri_user`, according to the locked R3.1 requirement. On app startup, stored phone/password are sent to the custom auth Edge Function to restore the authenticated UI state.

Logout removes `localStorage.asri_user`.

The current R3.1 requirement intentionally uses plaintext passwords in the custom table and localStorage. This is an explicit project requirement and is not presented as a secure production authentication pattern.

## Backend boundary

The frontend must use an API/service boundary for backend access. It must not access Supabase/PostgreSQL directly.

Custom auth endpoint:
- `POST /functions/v1/auth/register`
- `POST /functions/v1/auth/login`

The auth Edge Function uses server-side Supabase credentials to access `public.users`. The table has RLS enabled and no browser policies.

Product, cart, checkout, order, and tracking APIs remain deferred until their verified Edge Function contracts exist.

Existing Duitku payment backend remains under `supabase/` and is not duplicated in the frontend.

## Environment

Set:

```text
VITE_EDGE_FUNCTION_URL=https://<project-ref>.supabase.co
```

Public frontend configuration may use `VITE_*` variables only. Private credentials remain server-side.

## Verification

- Frontend build is covered by GitHub Actions.
- The custom `users` table was created in the connected Supabase project.
- The `auth` Edge Function is deployed with JWT verification disabled because it implements the explicitly requested custom phone/password authentication.
