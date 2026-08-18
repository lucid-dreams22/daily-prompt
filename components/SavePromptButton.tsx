"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import type { CategorySlug } from "@/lib/prompts";

export default function SavePromptButton({ category, date }: { category: CategorySlug; date: string }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [savedRowId, setSavedRowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function check() {
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("saved_prompts")
        .select("id")
        .eq("user_id", user.id)
        .eq("category_slug", category)
        .eq("prompt_date", date)
        .maybeSingle();
      if (!active) return;
      if (data) {
        setSaved(true);
        setSavedRowId(data.id);
      }
      setLoading(false);
    }
    check();
    return () => {
      active = false;
    };
  }, [user, category, date]);

  if (!user || loading) return null;

  async function toggle() {
    if (!user) return;
    if (saved && savedRowId) {
      await supabase.from("saved_prompts").delete().eq("id", savedRowId);
      setSaved(false);
      setSavedRowId(null);
    } else {
      const { data } = await supabase
        .from("saved_prompts")
        .insert({ user_id: user.id, category_slug: category, prompt_date: date })
        .select("id")
        .single();
      setSaved(true);
      setSavedRowId(data?.id ?? null);
    }
  }

  return (
    <button
      onClick={toggle}
      className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
        saved ? "bg-gold/20 border-gold text-ink" : "border-ink/20 text-ink-soft hover:border-gold"
      }`}
    >
      {saved ? "★ Saved" : "☆ Save this prompt"}
    </button>
  );
}
