"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORY_MAP, getPromptForDate, type CategorySlug } from "@/lib/prompts";

interface SavedPromptRow {
  id: string;
  category_slug: CategorySlug;
  prompt_date: string;
}

interface SavedResponseRow {
  id: string;
  response_id: string;
  responses: {
    content: string;
    category_slug: CategorySlug;
    prompt_date: string;
    created_at: string;
    profiles: { username: string } | null;
  } | null;
}

export default function SavedPage() {
  const { user, loading } = useAuth();
  const [prompts, setPrompts] = useState<SavedPromptRow[] | null>(null);
  const [responses, setResponses] = useState<SavedResponseRow[] | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("saved_prompts")
      .select("id, category_slug, prompt_date")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPrompts(data ?? []));

    supabase
      .from("saved_responses")
      .select("id, response_id, responses(content, category_slug, prompt_date, created_at, profiles(username))")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setResponses(((data as unknown) as SavedResponseRow[]) ?? []));
  }, [user]);

  if (loading) return null;

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center mt-16">
        <p className="text-ink-soft">
          <Link href="/login" className="text-gold underline">
            Log in
          </Link>{" "}
          to see what you've saved.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-2xl mx-auto">
      <h1 className="font-display italic text-3xl text-ink mb-8">Saved</h1>

      <section>
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mb-3">
          Saved prompts
        </h2>
        {prompts === null && <p className="text-sm text-ink-soft/60">Loading…</p>}
        {prompts?.length === 0 && <p className="text-sm text-ink-soft/70 italic">Nothing saved yet.</p>}
        <ul className="space-y-2 mb-10">
          {prompts?.map((p) => (
            <li key={p.id}>
              <Link
                href={`/prompt/${p.category_slug}/${p.prompt_date}`}
                className="block rounded-lg bg-white/60 hover:bg-white p-3 text-sm transition-colors"
              >
                <span className="text-xs font-mono uppercase text-ink-soft/60 mr-2">
                  {CATEGORY_MAP[p.category_slug].name}
                </span>
                {getPromptForDate(p.category_slug, p.prompt_date)}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mb-3">
          Saved responses
        </h2>
        {responses === null && <p className="text-sm text-ink-soft/60">Loading…</p>}
        {responses?.length === 0 && <p className="text-sm text-ink-soft/70 italic">Nothing saved yet.</p>}
        <ul className="space-y-2">
          {responses?.map((r) =>
            r.responses ? (
              <li key={r.id}>
                <Link
                  href={`/prompt/${r.responses.category_slug}/${r.responses.prompt_date}`}
                  className="block rounded-lg bg-white/60 hover:bg-white p-3 text-sm transition-colors"
                >
                  <span className="font-medium">{r.responses.profiles?.username ?? "someone"}</span>
                  <p className="text-ink-soft mt-1">{r.responses.content}</p>
                </Link>
              </li>
            ) : null
          )}
        </ul>
      </section>
    </div>
  );
}
