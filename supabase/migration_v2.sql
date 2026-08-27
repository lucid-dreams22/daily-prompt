-- Run this in the SQL Editor if you already ran the original schema.sql
-- and just want to add the new features (250-word limit + voting on
-- upcoming prompts). If you're setting up a brand new project, just run
-- the full schema.sql instead — you don't need this file too.

-- 1. Raise the response word limit from 200 to 250
alter table public.responses drop constraint if exists responses_content_check;
alter table public.responses
  add constraint responses_content_check
  check (
    char_length(trim(content)) > 0
    and array_length(regexp_split_to_array(trim(content), '\s+'), 1) <= 250
  );

-- 2. Prompt suggestions + votes (community picks for upcoming days)
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

drop policy if exists "Suggestions are viewable by everyone" on public.prompt_suggestions;
create policy "Suggestions are viewable by everyone"
  on public.prompt_suggestions for select
  using (true);

drop policy if exists "Signed-in users can suggest prompts" on public.prompt_suggestions;
create policy "Signed-in users can suggest prompts"
  on public.prompt_suggestions for insert
  with check (auth.uid() = created_by);

drop policy if exists "Users can delete their own suggestions" on public.prompt_suggestions;
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

drop policy if exists "Votes are viewable by everyone" on public.prompt_votes;
create policy "Votes are viewable by everyone"
  on public.prompt_votes for select
  using (true);

drop policy if exists "Signed-in users can vote" on public.prompt_votes;
create policy "Signed-in users can vote"
  on public.prompt_votes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own vote" on public.prompt_votes;
create policy "Users can remove their own vote"
  on public.prompt_votes for delete
  using (auth.uid() = user_id);

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

-- 3. Also fix the responses <-> profiles relationship, in case you
-- haven't already run this fix from earlier.
alter table public.responses drop constraint if exists responses_user_id_profiles_fkey;
alter table public.responses
  add constraint responses_user_id_profiles_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
