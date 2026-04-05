# Production Security Checklist

## What is it?
> A comprehensive checklist of security practices to follow when deploying a Supabase application to production. Covers RLS, key management, input validation, and common vulnerabilities.

## Why do we need it?
> Supabase exposes your database directly to the client via REST APIs. Without proper security measures, your data is one API call away from being exposed or modified. This checklist ensures our Todo app is hardened for production use.

## The Checklist

### 1. Row Level Security (RLS)
- [ ] RLS is enabled on EVERY table (no exceptions)
- [ ] Every table has explicit policies for SELECT, INSERT, UPDATE, DELETE
- [ ] Policies use `auth.uid()` to scope data to the authenticated user
- [ ] Junction tables have policies that check ownership via JOINs
- [ ] Test with 2+ users to verify data isolation

### 2. API Key Management
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the only key in client-side code
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NEVER in client-side code, NEVER in `.env` files committed to git
- [ ] `.env.local` is in `.gitignore`
- [ ] Service role key is only used in edge functions or trusted server environments
- [ ] `anon` key limitations are understood: it only has the permissions that RLS allows

### 3. Authentication
- [ ] Middleware uses `getUser()` (NOT `getSession()`) for auth checks
- [ ] Protected routes redirect to login when unauthenticated
- [ ] Auth callback route exists and handles email confirmation
- [ ] Email confirmation is enabled for production
- [ ] Session tokens are stored in HTTP-only cookies (via `@supabase/ssr`)

### 4. Input Validation
- [ ] All form inputs are validated with Zod BEFORE hitting Supabase
- [ ] Database has check constraints as a second line of defense
- [ ] Enum types prevent invalid values at the DB level
- [ ] Character length limits on text fields
- [ ] File upload size limits enforced

### 5. SQL Injection Protection
- [ ] Using the Supabase JS client (which parameterizes queries automatically)
- [ ] No raw SQL from user input
- [ ] `security definer` functions don't concatenate user input into SQL strings

### 6. CORS & Network
- [ ] Edge functions include proper CORS headers
- [ ] Site URL and Redirect URLs are configured in Supabase Auth settings
- [ ] No wildcard (`*`) CORS in production — specify exact origins

### 7. Data Exposure
- [ ] SELECT policies only expose necessary columns (or use `.select()` to limit)
- [ ] Sensitive fields (password hashes, etc.) are never in public tables
- [ ] Activity logs don't leak data from other users
- [ ] Error messages shown to users don't expose internal details

### 8. Rate Limiting
- [ ] Supabase has built-in rate limiting on auth endpoints
- [ ] Consider additional rate limiting for high-frequency operations
- [ ] Edge functions should validate request origin

## Implementation in our project

All of the above are implemented across:
- **RLS:** `supabase/migrations/007_create_rls_policies.sql`
- **Auth:** `src/lib/supabase/middleware.ts` (uses `getUser()`)
- **Validation:** `src/lib/validators/*.ts` (Zod schemas)
- **Keys:** `.env.local.example` (only public keys)
- **Constraints:** All migration files include `check` constraints

## Common Mistakes & Gotchas

1. **"I'll add RLS later"** — Add it first. Every minute without RLS is a data exposure risk.
2. **Trusting `getSession()`** — It reads an unvalidated cookie. Use `getUser()` for security-critical checks.
3. **Committing `.env.local`** — Add it to `.gitignore` immediately.
4. **Using service role key in API routes** — Next.js API routes can be called from the client. If they use the service role key, any authenticated user can trigger admin-level operations.
5. **Forgetting RLS on new tables** — Every new table needs `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + policies.

## Key Takeaways

- RLS is your primary security layer — enable it on every table, no exceptions
- `anon` key is safe to expose (RLS limits its power); `service_role` key is not
- Always validate inputs with Zod on the client AND constraints in the database
- Use `getUser()` not `getSession()` in server-side auth checks
- Test security with multiple user accounts to verify isolation

## Further Reading

- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/managing-user-data)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
