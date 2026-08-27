import { supabase } from "./supabaseClient";
import { getPromptForDate, todayStr, type CategorySlug } from "./prompts";

export const VOTES_NEEDED = 10;

/**
 * Returns the prompt text to actually show for a category/date.
 *
 * - If a suggestion has already been locked in for this exact date, use it.
 * - If this date is "today" and nothing is locked in yet, check whether a
 *   suggestion has crossed the vote threshold; if so, lock it in for today
 *   right now (first visitor of the day triggers it) and use it.
 * - Otherwise, fall back to the default rotating bank prompt.
 */
export async function getEffectivePrompt(category: CategorySlug, date: string): Promise<string> {
  const { data: locked } = await supabase
    .from("prompt_suggestions")
    .select("text")
    .eq("category_slug", category)
    .eq("used_for_date", date)
    .maybeSingle();

  if (locked) return locked.text;

  if (date === todayStr()) {
    const promoted = await tryPromote(category, date);
    if (promoted) return promoted;
  }

  return getPromptForDate(category, date);
}

async function tryPromote(category: CategorySlug, date: string): Promise<string | null> {
  const { data: winner } = await supabase
    .from("suggestion_votes")
    .select("id, text, vote_count")
    .eq("category_slug", category)
    .is("used_for_date", null)
    .gte("vote_count", VOTES_NEEDED)
    .order("vote_count", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!winner) return null;

  const { error } = await supabase
    .from("prompt_suggestions")
    .update({ used_for_date: date })
    .eq("id", winner.id)
    .is("used_for_date", null);

  if (error) return null; // someone else promoted it first, or it's not our race to win
  return winner.text;
}

/** Batch version for pages showing all 3 categories on one date (e.g. the homepage). */
export async function getEffectivePrompts(
  categories: CategorySlug[],
  date: string
): Promise<Record<CategorySlug, string>> {
  const entries = await Promise.all(categories.map(async (c) => [c, await getEffectivePrompt(c, date)] as const));
  return Object.fromEntries(entries) as Record<CategorySlug, string>;
}
