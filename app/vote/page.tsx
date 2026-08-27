"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIES, type CategorySlug } from "@/lib/prompts";
import { VOTES_NEEDED } from "@/lib/promptOverrides";

interface Suggestion {
  id: string;
  category_slug: CategorySlug;
  text: string;
  vote_count: number;
  votedByMe: boolean;
}

export default function VotePage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<CategorySlug>("reflect");
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const { data: rows } = await supabase
      .from("suggestion_votes")
      .select("id, category_slug, text, vote_count")
      .eq("category_slug", activeCategory)
      .is("used_for_date", null)
      .order("vote_count", { ascending: false });

    let mine = new Set<string>();
    if (user && rows && rows.length > 0) {
      const { data: myVotes } = await supabase
        .from("prompt_votes")
        .select("suggestion_id")
        .eq("user_id", user.id);
      mine = new Set((myVotes ?? []).map((v) => v.suggestion_id));
    }

    setSuggestions((rows ?? []).map((r) => ({ ...r, votedByMe: mine.has(r.id) })));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, user]);

  async function submitSuggestion(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newText.trim()) return;
    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase.from("prompt_suggestions").insert({
      category_slug: activeCategory,
      text: newText.trim(),
      created_by: user.id,
    });
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setNewText("");
    load();
  }

  async function toggleVote(s: Suggestion) {
    if (!user) return;
    if (s.votedByMe) {
      await supabase.from("prompt_votes").delete().eq("suggestion_id", s.id).eq("user_id", user.id);
    } else {
      await supabase.from("prompt_votes").insert({ suggestion_id: s.id, user_id: user.id });
    }
    load();
  }

  return (
    <div className="fade-in max-w-2xl mx-auto">
      <h1 className="font-display italic text-3xl text-ink mb-1">Suggest &amp; vote</h1>
      <p className="text-sm text-ink-soft mb-8">
        Propose a question for a category. Once one reaches {VOTES_NEEDED} votes, it becomes the
        next day's prompt for that category.
      </p>

      <div className="flex gap-2 mb-8 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c.slug}
            onClick={() => setActiveCategory(c.slug)}
            className={`px-3 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest border transition-colors ${
              activeCategory === c.slug
                ? "bg-ink text-paper border-ink"
                : "border-ink/20 text-ink-soft hover:border-ink/40"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {suggestions === null && <p className="text-sm text-ink-soft/60 font-mono">Loading…</p>}
      {suggestions?.length === 0 && (
        <p className="text-sm text-ink-soft/70 italic mb-6">
          No suggestions yet for this category — be the first!
        </p>
      )}

      <ul className="space-y-3 mb-8">
        {suggestions?.map((s) => {
          const pct = Math.min(100, Math.round((s.vote_count / VOTES_NEEDED) * 100));
          return (
            <li key={s.id} className="bg-white/60 rounded-xl p-4 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm text-ink">{s.text}</p>
                <button
                  onClick={() => toggleVote(s)}
                  disabled={!user}
                  className={`shrink-0 flex flex-col items-center px-3 py-1.5 rounded-lg text-xs font-mono border transition-colors disabled:opacity-40 ${
                    s.votedByMe ? "bg-gold/25 border-gold text-ink" : "border-ink/20 text-ink-soft hover:border-gold"
                  }`}
                  title={user ? "Vote for this prompt" : "Log in to vote"}
                >
                  <span>▲</span>
                  <span>{s.vote_count}</span>
                </button>
              </div>
              <div className="mt-2 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-ink-soft/60 font-mono mt-1">
                {s.vote_count} / {VOTES_NEEDED} votes
              </p>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-ink/10 pt-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mb-2">
          Suggest a prompt
        </h2>
        {!user ? (
          <p className="text-sm text-ink-soft">
            <Link href="/login" className="text-gold underline">
              Log in
            </Link>{" "}
            or{" "}
            <Link href="/signup" className="text-gold underline">
              sign up
            </Link>{" "}
            to suggest a prompt.
          </p>
        ) : (
          <form onSubmit={submitSuggestion}>
            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="What question should we ask?"
              rows={3}
              maxLength={200}
              className="w-full rounded-xl border border-ink/15 bg-white/70 p-3 text-sm text-ink placeholder:text-ink-soft/50 focus:bg-white outline-none resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={submitting || !newText.trim()}
                className="text-xs font-medium bg-ink text-paper px-4 py-1.5 rounded-full disabled:opacity-40 hover:bg-ink-soft transition-colors"
              >
                {submitting ? "Submitting…" : "Submit suggestion"}
              </button>
            </div>
            {error && <p className="text-xs text-rust mt-1">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
