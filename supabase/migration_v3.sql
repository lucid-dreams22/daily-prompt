-- Run this if you already ran migration_v2.sql (the earlier per-date voting
-- system). This switches suggestions to be category-only (no date picker)
-- and auto-promotes a suggestion to the next open day once it hits 10 votes.

drop view if exists public.winning_suggestions;

alter table public.prompt_suggestions drop column if exists prompt_date;
alter table public.prompt_suggestions add column if not exists used_for_date date;

drop index if exists prompt_suggestions_lookup_idx;
create index if not exists prompt_suggestions_lookup_idx
  on public.prompt_suggestions (category_slug, used_for_date);

drop policy if exists "Users can delete their own suggestions" on public.prompt_suggestions;
create policy "Users can delete their own unused suggestions"
  on public.prompt_suggestions for delete
  using (auth.uid() = created_by and used_for_date is null);

drop policy if exists "Signed-in users can promote a suggestion to a date" on public.prompt_suggestions;
create policy "Signed-in users can promote a suggestion to a date"
  on public.prompt_suggestions for update
  using (auth.uid() is not null and used_for_date is null);

create or replace view public.suggestion_votes as
select
  s.id,
  s.category_slug,
  s.text,
  s.used_for_date,
  s.created_at,
  count(v.id) as vote_count
from public.prompt_suggestions s
left join public.prompt_votes v on v.suggestion_id = s.id
group by s.id, s.category_slug, s.text, s.used_for_date, s.created_at;
