# Supabase Authentication

## What is it?
> Supabase Auth is a complete authentication system built on top of GoTrue. It handles user signup, login, sessions, JWTs, and token refresh — all without building a custom auth backend. It supports email/password, magic links, OAuth providers, and more.

## Why do we need it?
> Our Todo app needs multi-user support with data isolation. Auth provides user identity, which RLS uses to restrict data access. Without auth, we can't know who is making requests, and RLS policies have nothing to enforce.

## How it works (under the hood)

### JWT-Based Auth Flow
1. User signs up/signs in via Supabase Auth API
2. Supabase returns a JWT (access token) + refresh token
3. JWT is stored in a cookie (for SSR compatibility)
4. Every Supabase client request includes the JWT in the Authorization header
5. PostgREST extracts the `sub` claim (user UUID) and makes it available as `auth.uid()`
6. RLS policies use `auth.uid()` to filter data

### Access Token vs Refresh Token
- **Access token (JWT):** Short-lived (~1 hour). Contains the user's ID and metadata. Sent with every API request.
- **Refresh token:** Long-lived. Used to get a new access token when the current one expires.

### `getSession()` vs `getUser()` — Critical Distinction
```typescript
// INSECURE for middleware — reads JWT from cookie without server validation
const { data: { session } } = await supabase.auth.getSession();

// SECURE — validates the JWT with the Supabase Auth server
const { data: { user } } = await supabase.auth.getUser();
```
**Why it matters:** `getSession()` only reads the cookie. A malicious user could forge/modify the cookie. `getUser()` makes a server roundtrip to verify the token is legitimate. Always use `getUser()` in middleware and server-side code where security matters.

### Cookie-Based Auth with Next.js
Supabase uses `@supabase/ssr` to store auth tokens in cookies (not localStorage). This enables:
- Server-side rendering with authenticated data
- Middleware-based route protection
- No client-side token management

### The Middleware Refresh Pattern
```
Browser Request
  -> Next.js Middleware
    -> Read auth cookie
    -> Call supabase.auth.getUser() (validates + refreshes if needed)
    -> Update cookie with new tokens
    -> Forward request (or redirect if unauthenticated)
```

Our middleware (`src/middleware.ts`) runs on every request and:
1. Refreshes the session token if it's close to expiring
2. Redirects unauthenticated users away from `/dashboard/*`
3. Redirects authenticated users away from `/login` and `/signup`

### `onAuthStateChange` Events
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  // event types:
  // 'INITIAL_SESSION' — first load
  // 'SIGNED_IN' — user just logged in
  // 'SIGNED_OUT' — user just logged out
  // 'TOKEN_REFRESHED' — access token was refreshed
  // 'USER_UPDATED' — user metadata changed
});
```
We use this in `AuthProvider` to keep the Zustand store in sync.

### Email Confirmation Flow
1. User signs up with email + password
2. Supabase sends a confirmation email with a link
3. Link redirects to `/auth/callback?code=xxx`
4. Our callback route exchanges the code for a session
5. User is redirected to `/dashboard`

## Implementation in our project

**Supabase clients:**
- `src/lib/supabase/client.ts` — Browser client (uses `createBrowserClient`)
- `src/lib/supabase/server.ts` — Server client (uses `createServerClient` with cookies)
- `src/lib/supabase/middleware.ts` — Middleware helper (session refresh + route protection)
- `src/lib/supabase/admin.ts` — Service role client (edge functions only)

**Auth flow:**
- `src/middleware.ts` — Route protection + session refresh
- `src/app/auth/callback/route.ts` — OAuth/email confirmation callback
- `src/hooks/use-auth.ts` — `signIn`, `signUp`, `signOut` with router integration
- `src/stores/auth-store.ts` — Zustand store for user state
- `src/components/common/AuthProvider.tsx` — Listens to `onAuthStateChange`
- `src/components/auth/LoginForm.tsx` — Login with Zod validation
- `src/components/auth/SignupForm.tsx` — Signup with Zod validation

## Supabase Dashboard Steps

1. Go to **Authentication -> Providers** — Email should be enabled by default
2. Go to **Authentication -> URL Configuration**:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: Add `http://localhost:3000/auth/callback`
3. Optionally disable email confirmation for development:
   - **Authentication -> Providers -> Email** -> Toggle off "Confirm email"

## Common Mistakes & Gotchas

1. **Using `getSession()` in middleware** — Insecure. Always use `getUser()` for server-side validation
2. **Forgetting to set cookies in the server client** — Auth tokens live in cookies for SSR. Without the cookie config, sessions don't persist
3. **Not handling the auth callback** — Without `/auth/callback`, email confirmation links break
4. **Using `@supabase/auth-helpers-nextjs`** — This is deprecated. Use `@supabase/ssr` instead
5. **Exposing `service_role` key in client code** — This key bypasses RLS. Only use it in edge functions or server-only code
6. **Not refreshing tokens in middleware** — Expired tokens cause silent auth failures

## Key Takeaways

- Supabase Auth uses JWTs stored in cookies for SSR-compatible authentication
- Always use `getUser()` (not `getSession()`) for server-side auth checks
- `@supabase/ssr` is the current package for Next.js integration
- The middleware refresh pattern keeps sessions alive transparently
- `auth.uid()` in RLS policies comes directly from the JWT's `sub` claim
- `onAuthStateChange` keeps client-side state in sync with auth events

## Further Reading

- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase Auth Concepts](https://supabase.com/docs/guides/auth)
- [@supabase/ssr package](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
