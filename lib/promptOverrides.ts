import { supabase } from "./supabaseClient";
import { getPromptForDate, type CategorySlug } from "./prompts";

/**
 * Returns the prompt text to actually show for a category/date: a
 * community-voted suggestion if one exists (and has at least 1 vote),
 * otherwise the default rotating bank prompt.
 */
export async function getEffectivePrompt(category: CategorySlug, date: string): Promise<string> {
  const { data } = await supabase
    .from("winning_suggestions")
    .select("text, vote_count")
    .eq("category_slug", category)
    .eq("prompt_date", date)
    .maybeSingle();

  if (data && data.vote_count > 0) {
    return data.text;
  }
  return getPromptForDate(category, date);
}

/** Batch version for pages showing all 3 categories on one date (e.g. the homepage). */
export async function getEffectivePrompts(
  categories: CategorySlug[],
  date: string
): Promise<Record<CategorySlug, string>> {
  const { data } = await supabase
    .from("winning_suggestions")
    .select("category_slug, text, vote_count")
    .eq("prompt_date", date);

  const overrides = new Map<string, string>();
  (data ?? []).forEach((row) => {
    if (row.vote_count > 0) overrides.set(row.category_slug, row.text);
  });

  const result = {} as Record<CategorySlug, string>;
  categories.forEach((c) => {
    result[c] = overrides.get(c) ?? getPromptForDate(c, date);
  });
  return result;
}
