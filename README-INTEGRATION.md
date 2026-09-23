# API Gateway — Integration Guide

This adds to your existing **github-oauth-login** project: your own API-key
system that lets clients call your endpoint, while your server calls Groq /
OpenRouter (free models) behind the scenes.

## 1. Copy files into your repo

Copy this entire folder's contents (`lib/`, `app/`) into your existing
Next.js project, merging with what's already there. Don't overwrite your
existing `app/api/auth/[...nextauth]/...` files.

Install the one new dependency:

```bash
npm install @supabase/supabase-js
```

## 2. Fix two import paths

- `lib/getUser.ts` imports `authOptions` from `@/lib/auth`. Change this to
  wherever your NextAuth config actually lives (often
  `app/api/auth/[...nextauth]/route.ts`). Also adjust the `githubId` field
  name to match what your session actually exposes.
- Make sure your GitHub OAuth callback puts a stable user id (GitHub numeric
  id, or `sub`) somewhere on the session — that's what links a login to a
  row in the new `users` table.

## 3. Database (already done for you)

A new Supabase project **`github-oauth-login-api-gateway`** was created and
the schema (`users`, `api_keys`, `usage_logs`) is already applied. Nothing to
run manually — just copy the URL/keys into env vars (step 4).

> Note: your Supabase free tier only allows 2 active projects, so
> **`Build AppPublish Hub` was paused** to make room. Resume it anytime from
> the Supabase dashboard if you need it — pausing doesn't delete data.

## 4. Environment variables

Copy `.env.example` → `.env.local` for local dev, and add the same keys in
**Vercel → your project → Settings → Environment Variables**:

| Key | Where to get it |
|---|---|
| `SUPABASE_URL` | Already filled in `.env.example` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` (secret) |
| `GROQ_API_KEY` | https://console.groq.com/keys (free) |
| `OPENROUTER_API_KEY` | https://openrouter.ai/keys (free) |
| `NEXT_PUBLIC_SITE_URL` | Your live Vercel URL |

⚠️ I can't add these for you — Vercel doesn't allow reading/writing secret
values through this integration for security reasons. Add them yourself in
the dashboard, then redeploy.

## 5. Push and deploy

```bash
git add .
git commit -m "Add API key gateway: Groq + OpenRouter proxy, dashboard, playground, docs"
git push
```

Vercel will auto-deploy since it's already linked to this GitHub repo.

## 6. What you get

| Page/Route | Purpose |
|---|---|
| `/dashboard` | Create, hide, revoke, reactivate, delete API keys |
| `/profile` | Shows logged-in GitHub user + logout button |
| `/playground` | Test any key against any model in the browser |
| `/docs` | Public API documentation for your users |
| `POST /api/v1/chat/completions` | Main gateway — clients call this with YOUR issued key |
| `GET /api/v1/models` | Lists every supported free model |

## 7. Notes / next steps

- Streaming responses aren't wired up yet (`stream: false` is hardcoded) —
  straightforward to add later with `ReadableStream` once the base flow is
  confirmed working.
- OpenRouter's free-model lineup changes over time. `lib/models.ts` has a
  static list — consider fetching `https://openrouter.ai/api/v1/models` and
  filtering for `pricing.prompt === "0"` if you want it to stay current
  automatically.
- Basic per-key rate limiting isn't implemented — worth adding (e.g. via
  Supabase counts or Vercel KV) before opening this up publicly.
