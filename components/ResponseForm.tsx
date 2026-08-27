"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import { MAX_WORDS, wordCount, type CategorySlug } from "@/lib/prompts";

export default function ResponseForm({
  category,
  date,
  parentId = null,
  compact = false,
  onPosted,
  onCancel,
}: {
  category: CategorySlug;
  date: string;
  parentId?: string | null;
  compact?: boolean;
  onPosted?: () => void;
  onCancel?: () => void;
}) {
  const { user, loading } = useAuth();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const words = wordCount(content);
  const overLimit = words > MAX_WORDS;

  if (loading) return null;

  if (!user) {
    return (
      <div className={`rounded-xl border border-dashed border-ink/25 p-4 text-sm text-ink-soft ${compact ? "" : "mt-2"}`}>
        <Link href="/login" className="text-gold font-medium underline">
          Log in
        </Link>{" "}
        or{" "}
        <Link href="/signup" className="text-gold font-medium underline">
          sign up
        </Link>{" "}
        to {parentId ? "reply" : "post a response"}.
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || overLimit || !user) return;
    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase.from("responses").insert({
      category_slug: category,
      prompt_date: date,
      content: content.trim(),
      parent_id: parentId,
      user_id: user.id,
    });
    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setContent("");
    onPosted?.();
  }

  return (
    <form onSubmit={submit} className={compact ? "mt-3" : "mt-2"}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentId ? "Write a reply…" : "Write your response…"}
        rows={compact ? 4 : 7}
        className="w-full rounded-xl border border-ink/15 bg-white/70 p-3 text-sm text-ink placeholder:text-ink-soft/50 focus:bg-white outline-none resize-y min-h-[7rem]"
      />
      <div className="flex items-center justify-between mt-2">
        <span className={`font-mono text-xs ${overLimit ? "text-rust" : "text-ink-soft/60"}`}>
          {words} / {MAX_WORDS} words
        </span>
        <div className="flex gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-medium text-ink-soft px-3 py-1.5"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || !content.trim() || overLimit}
            className="text-xs font-medium bg-ink text-paper px-4 py-1.5 rounded-full disabled:opacity-40 hover:bg-ink-soft transition-colors"
          >
            {submitting ? "Posting…" : parentId ? "Post reply" : "Post response"}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-rust mt-1">{error}</p>}
    </form>
  );
}
