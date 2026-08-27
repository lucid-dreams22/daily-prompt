"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORIES, todayStr, type CategorySlug } from "@/lib/prompts";

interface Suggestion {
  id: string;
  category_slug: CategorySlug;
  prompt_date: string;
  text: string;
  created_by: string;
  votes: number;
  votedByMe: boolean;
}

function nextDays(n: number): string[] {
  const today = new Date(todayStr() + "T00:00:00Z");
  const out: string[] = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

export default function VotePage() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState<CategorySlug>("reflect");
  const [activeDate, setActiveDate] = useState<string>(nextDays(1)[0]);
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [newText, setNewText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upcomingDates = useMemo(() => nextDays(7), []);

  async function load() {
    const { data: sugg } = await supabase
      .from("prompt_suggestions")
      .select("id, category_slug, prompt_date, text, created_by")
      .eq("category_slug", activeCategory)
      .eq("prompt_date", activeDate)
      .order("created_at", { ascending: true });

    const { data: votes } = await supabase
      .from("prompt_votes")
      .select("suggestion_id, user_id");

    const counts = new Map<string, number>();
    const mine = new Set<string>();
    (votes ?? []).forEach((v) => {
      counts.set(v.suggestion_id, (counts.get(v.suggestion_id) ?? 0) + 1);
      if (user && v.user_id === user.id) mine.add(v.suggestion_id);
    });

    const merged: Suggestion[] = (sugg ?? []).map((s) => ({
      ...s,
      votes: counts.get(s.id) ?? 0,
      votedByMe: mine.has(s.id),
    }));
    merged.sort((a, b) => b.votes - a.votes);
    setSuggestions(merged);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, activeDate, user]);

  async function submitSuggestion(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !newText.trim()) return;
    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase.from("prompt_suggestions").insert({
      category_slug: activeCategory,
      prompt_date: activeDate,
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
      <h1 className="font-display italic text-3xl text-ink mb-1">Suggest &amp; vote 🍁</h1>
      <p className="text-sm text-ink-soft mb-8">
        Propose a question for an upcoming day, and vote for your favorites. The most-voted
        suggestion becomes that day's actual prompt.
      </p>

      <div className="flex gap-2 mb-4 flex-wrap">
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

      <div className="flex gap-2 mb-8 flex-wrap">
        {upcomingDates.map((d) => {
          const label = new Date(d + "T00:00:00Z").toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          });
          return (
            <button
              key={d}
              onClick={() => setActiveDate(d)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono border transition-colors ${
                activeDate === d
                  ? "bg-gold/25 border-gold text-ink"
                  : "border-ink/15 text-ink-soft hover:border-gold/60"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {suggestions === null && <p className="text-sm text-ink-soft/60 font-mono">Loading…</p>}
      {suggestions?.length === 0 && (
        <p className="text-sm text-ink-soft/70 italic mb-6">
          No suggestions yet for this day — be the first!
        </p>
      )}

      <ul className="space-y-3 mb-8">
        {suggestions?.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between gap-4 bg-white/60 rounded-xl p-4 shadow-card"
          >
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
              <span>{s.votes}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="border-t border-ink/10 pt-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mb-2">
          Suggest one for this day
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
              placeholder="What question should we ask that day?"
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
