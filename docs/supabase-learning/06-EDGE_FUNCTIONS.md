# Supabase Edge Functions

## What is it?
> Edge Functions are server-side TypeScript functions that run on Supabase's edge infrastructure (powered by Deno). They handle logic that can't or shouldn't run in the browser — like scheduled jobs, webhooks, sending emails, or accessing the database with the service role key.

## Why do we need it?
> Our Todo app needs a "send reminder" function that runs on a schedule to check for todos with approaching due dates and create notification records. This can't run in the browser because: (1) it needs to query across all users, (2) it needs the service role key to bypass RLS, and (3) it needs to run even when no user is online.

## How it works (under the hood)

### Deno Runtime
Edge Functions use Deno (not Node.js). Key differences:
- TypeScript is natively supported (no compilation step)
- Imports use URLs: `import { x } from 'https://esm.sh/package'`
- Uses Web Standard APIs (fetch, Request, Response)
- Has a permissions model (network, file system, env vars)

### Function Structure
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Create admin client with service role key
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Your logic here...

  return new Response(JSON.stringify({ result }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Environment Variables
Supabase automatically provides:
- `SUPABASE_URL` — Your project URL
- `SUPABASE_ANON_KEY` — The anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — The admin key (bypasses RLS)

Custom env vars can be set via `supabase secrets set KEY=value`.

### Invoking Edge Functions

**From the client:**
```typescript
const { data, error } = await supabase.functions.invoke('send-reminder', {
  body: { some: 'data' },
});
```

**Via HTTP:**
```
POST https://your-project.supabase.co/functions/v1/send-reminder
Authorization: Bearer <anon-key or service-role-key>
```

**On a schedule:** Use pg_cron or Supabase's scheduled functions feature.

### Service Role Client
Inside edge functions, we create a client with the `service_role` key:
```typescript
const supabaseAdmin = createClient(URL, SERVICE_ROLE_KEY);
```
This client bypasses ALL RLS policies — it has full database access. This is necessary for cross-user operations like "find all todos due soon across all users."

## Implementation in our project

**File:** `supabase/functions/send-reminder/index.ts`

Our `send-reminder` function:
1. Queries todos with `due_date` in the next 24 hours
2. Filters out completed/cancelled todos
3. Creates notification records in the `notifications` table
4. Returns the count of reminders sent

## Supabase Dashboard Steps

1. Install the Supabase CLI: `npm install -g supabase`
2. Link your project: `supabase link --project-ref your-ref`
3. Deploy the function: `supabase functions deploy send-reminder`
4. Set secrets if needed: `supabase secrets set RESEND_API_KEY=xxx`
5. Test: `supabase functions invoke send-reminder`
6. (Optional) Set up a cron schedule in **Database -> Extensions -> pg_cron**

## Common Mistakes & Gotchas

1. **Using Node.js syntax** — Edge Functions use Deno. No `require()`, no `process.env`. Use `import` and `Deno.env.get()`.
2. **Forgetting CORS headers** — If calling from the browser, you need CORS headers in the response AND handle OPTIONS preflight.
3. **Exposing the service role key** — Never use it in client-side code. Only in edge functions.
4. **Not handling errors** — Edge functions should return proper HTTP status codes (200, 400, 500).
5. **Cold starts** — Edge functions have a small cold start delay (~100-500ms) on first invocation.

## Key Takeaways

- Edge Functions run server-side TypeScript on Deno (not Node.js)
- Use the `service_role` key inside edge functions for cross-user operations
- Supabase auto-provides URL and keys as environment variables
- Deploy via Supabase CLI: `supabase functions deploy <name>`
- Use cases: scheduled jobs, webhooks, email sending, custom auth logic

## Further Reading

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Deno Deploy](https://deno.com/deploy)
