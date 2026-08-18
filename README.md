# Daily Prompt

Three new questions every day, in three categories — **Reflect**, **Imagine**, **Discover**.
Anyone can read today's prompts and every past day's archive without an account.
Creating an account lets you post a response (max 200 words), reply to other people's
responses (even on archived days), and save prompts or responses for later.

Responses are shown in a **waterfall** (masonry) layout — each top-level response is a card
containing its own thread of replies, and the cards flow into columns, newest first.

---

## How it works

- **No cron job, no admin panel needed for daily rotation.** Each category has a bank of ~30
  hand-written prompts in `lib/prompts.ts`. The "prompt of the day" for any date is computed
  deterministically from the number of days since a fixed epoch date (`EPOCH` in that file),
  so today's prompt, yesterday's prompt, and next year's prompt are all just math — no database
  row needs to exist for a prompt itself. Add more prompts to the arrays any time; the rotation
  automatically gets longer.
- **Responses, replies, and saves live in Postgres** (via [Supabase](https://supabase.com)),
  keyed by `category_slug` + `prompt_date`, which lines up with the computed prompt above.
- **Auth** is Supabase's built-in email/password auth. Row Level Security policies (in
  `supabase/schema.sql`) enforce that anyone can *read* responses, but only signed-in users can
  *write* them, and only the author can edit/delete their own.

This is a completely standard [Next.js](https://nextjs.org) app, so it can be hosted for free.

---

## 1. Set up the free database (Supabase)

1. Go to [supabase.com](https://supabase.com) → **New project** (the free tier is enough for
   this app — 500MB database, 50k monthly active users).
2. Once it's created, open the **SQL Editor** and paste in the entire contents of
   [`supabase/schema.sql`](./supabase/schema.sql), then **Run** it. This creates the
   `profiles`, `responses`, `saved_prompts`, and `saved_responses` tables with the right
   security policies.
3. Go to **Project Settings → API**. You'll need two values for the next step:
   - **Project URL**
   - **anon public** key
4. (Optional but recommended for a real launch) Under **Authentication → Providers → Email**,
   you can turn off "Confirm email" while testing, or leave it on for production so people
   verify their address before posting.

## 2. Run it locally

```bash
npm install
cp .env.local.example .env.local
# edit .env.local and paste in your Supabase Project URL + anon key
npm run dev
```

Visit `http://localhost:3000`.

## 3. Deploy for free (Vercel)

1. Push this folder to a new GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import that repo. Vercel
   auto-detects Next.js, so you don't need to change any build settings.
3. Under **Environment Variables**, add the same two values from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Vercel's free (Hobby) tier is enough to run this site publicly at no cost.
5. Back in Supabase, go to **Authentication → URL Configuration** and add your new
   `https://your-app.vercel.app` domain to the allowed redirect/site URLs, so email
   confirmations and auth work in production.

That's it — Supabase (free) + Vercel (free) = $0/month hosting.

---

## Customizing

- **Change the three categories or their prompts**: edit `lib/prompts.ts`. Keep the `slug`
  values (`reflect` / `imagine` / `discover`) in sync with the `check` constraint in
  `supabase/schema.sql` if you rename them.
- **Change the look**: colors, fonts, and layout tokens are centralized in
  `tailwind.config.ts` and `app/globals.css`.
- **Max response length**: `MAX_WORDS` in `lib/prompts.ts` (also enforced by a database
  check constraint in `supabase/schema.sql`, so it can't be bypassed by calling the API directly).

## Project structure

```
app/
  page.tsx                     Home — today's 3 prompts
  archive/page.tsx             List of all past days
  archive/[date]/page.tsx      A specific past day's 3 prompts
  prompt/[category]/[date]/    Prompt detail: response form + waterfall
  login/, signup/, saved/      Auth + saved prompts/responses
components/
  ResponseForm.tsx             Posting a response or reply (requires login)
  ResponseWaterfall.tsx        Fetches + builds the reply tree, renders the masonry columns
  ResponseItem.tsx             One response card, recursively rendering replies
  SavePromptButton.tsx         Bookmark a prompt
lib/
  prompts.ts                   Categories, prompt banks, date → prompt rotation logic
  supabaseClient.ts            Supabase browser client
  AuthProvider.tsx             React context exposing the current user
supabase/
  schema.sql                   Tables + Row Level Security policies
```
