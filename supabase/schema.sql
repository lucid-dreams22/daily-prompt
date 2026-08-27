-- Daily Prompt — database schema for Supabase (Postgres)
-- Run this once in your Supabase project's SQL editor.

-- ────────────────────────────────────────────────────────────
-- Profiles (one row per auth user, so we have a public display name)
-- ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up,
-- using the username they passed in during sign-up (see app/signup).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────
-- Responses (top-level responses to a daily prompt, and replies to
-- other responses, via parent_id — this is what makes the waterfall).
-- ────────────────────────────────────────────────────────────
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null check (category_slug in ('reflect', 'imagine', 'discover')),
  prompt_date date not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_id uuid references public.responses(id) on delete cascade,
  content text not null check (
    char_length(trim(content)) > 0
    and array_length(regexp_split_to_array(trim(content), '\s+'), 1) <= 250
  ),
  created_at timestamptz not null default now()
);

create index if not exists responses_prompt_idx
  on public.responses (category_slug, prompt_date, created_at desc);

create index if not exists responses_parent_idx
  on public.responses (parent_id);

alter table public.responses enable row level security;

create policy "Responses are viewable by everyone"
  on public.responses for select
  using (true);

create policy "Signed-in users can post responses"
  on public.responses for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own responses"
  on public.responses for delete
  using (auth.uid() = user_id);

create policy "Users can edit their own responses"
  on public.responses for update
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- Prompt suggestions & votes — users propose a prompt for a future day
-- in a given category, and vote on their favorite. The top-voted
-- suggestion for a date (if any) is used INSTEAD of the default
-- rotating bank prompt for that day. See getPromptOverride() in lib/prompts.ts.
-- ────────────────────────────────────────────────────────────
create table if not exists public.prompt_suggestions (
  id uuid primary key default gen_random_uuid(),
  category_slug text not null check (category_slug in ('reflect', 'imagine', 'discover')),
  prompt_date date not null,
  text text not null check (char_length(trim(text)) between 5 and 200),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists prompt_suggestions_lookup_idx
  on public.prompt_suggestions (category_slug, prompt_date);

alter table public.prompt_suggestions enable row level security;

create policy "Suggestions are viewable by everyone"
  on public.prompt_suggestions for select
  using (true);

create policy "Signed-in users can suggest prompts"
  on public.prompt_suggestions for insert
  with check (auth.uid() = created_by);

create policy "Users can delete their own suggestions"
  on public.prompt_suggestions for delete
  using (auth.uid() = created_by);

create table if not exists public.prompt_votes (
  id uuid primary key default gen_random_uuid(),
  suggestion_id uuid not null references public.prompt_suggestions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (suggestion_id, user_id)
);

alter table public.prompt_votes enable row level security;

create policy "Votes are viewable by everyone"
  on public.prompt_votes for select
  using (true);

create policy "Signed-in users can vote"
  on public.prompt_votes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own vote"
  on public.prompt_votes for delete
  using (auth.uid() = user_id);

-- A view that returns each date/category's winning (most-voted) suggestion,
-- so the app can ask "is there a community pick for this day?" in one query.
create or replace view public.winning_suggestions as
select distinct on (s.category_slug, s.prompt_date)
  s.id,
  s.category_slug,
  s.prompt_date,
  s.text,
  count(v.id) as vote_count
from public.prompt_suggestions s
left join public.prompt_votes v on v.suggestion_id = s.id
group by s.id, s.category_slug, s.prompt_date, s.text
order by s.category_slug, s.prompt_date, count(v.id) desc, s.created_at asc;

create table if not exists public.saved_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_slug text not null check (category_slug in ('reflect', 'imagine', 'discover')),
  prompt_date date not null,
  created_at timestamptz not null default now(),
  unique (user_id, category_slug, prompt_date)
);

alter table public.saved_prompts enable row level security;

create policy "Users can view their own saved prompts"
  on public.saved_prompts for select
  using (auth.uid() = user_id);

create policy "Users can save prompts"
  on public.saved_prompts for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave prompts"
  on public.saved_prompts for delete
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- Saved responses (bookmarking someone else's response) — signed-in only.
-- ────────────────────────────────────────────────────────────
create table if not exists public.saved_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  response_id uuid not null references public.responses(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, response_id)
);

alter table public.saved_responses enable row level security;

create policy "Users can view their own saved responses"
  on public.saved_responses for select
  using (auth.uid() = user_id);

create policy "Users can save responses"
  on public.saved_responses for insert
  with check (auth.uid() = user_id);

create policy "Users can unsave responses"
  on public.saved_responses for delete
  using (auth.uid() = user_id);
