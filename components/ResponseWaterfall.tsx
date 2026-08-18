"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/AuthProvider";
import ResponseItem, { type ResponseNode } from "./ResponseItem";
import type { CategorySlug } from "@/lib/prompts";

interface RawRow {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: { username: string } | null;
}

function buildTree(rows: RawRow[]): ResponseNode[] {
  const nodes = new Map<string, ResponseNode>();
  rows.forEach((r) => {
    nodes.set(r.id, {
      id: r.id,
      content: r.content,
      created_at: r.created_at,
      user_id: r.user_id,
      parent_id: r.parent_id,
      username: r.profiles?.username ?? "someone",
      children: [],
    });
  });
  const roots: ResponseNode[] = [];
  nodes.forEach((node) => {
    if (node.parent_id && nodes.has(node.parent_id)) {
      nodes.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  // newest top-level responses first, so the waterfall reads freshest-first
  roots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  // replies read oldest-first within a thread, like a conversation
  const sortChildren = (n: ResponseNode) => {
    n.children.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    n.children.forEach(sortChildren);
  };
  roots.forEach(sortChildren);
  return roots;
}

export default function ResponseWaterfall({ category, date }: { category: CategorySlug; date: string }) {
  const { user } = useAuth();
  const [roots, setRoots] = useState<ResponseNode[] | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from("responses")
      .select("id, content, created_at, user_id, parent_id, profiles(username)")
      .eq("category_slug", category)
      .eq("prompt_date", date)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      return;
    }
    setRoots(buildTree(((data as unknown) as RawRow[]) ?? []));

    if (user) {
      const { data: saved } = await supabase
        .from("saved_responses")
        .select("response_id")
        .eq("user_id", user.id);
      setSavedIds(new Set((saved ?? []).map((s) => s.response_id)));
    }
  }, [category, date, user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSavedChange = (id: string, saved: boolean) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (saved) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  if (error) return <p className="text-sm text-rust">Couldn't load responses: {error}</p>;
  if (!roots) return <p className="text-sm text-ink-soft/60 font-mono">Loading responses…</p>;
  if (roots.length === 0)
    return (
      <p className="text-sm text-ink-soft/70 italic mt-6">
        No responses yet — be the first to answer today's question.
      </p>
    );

  return (
    <div className="mt-8 columns-1 sm:columns-2 gap-5 [column-fill:_balance]">
      {roots.map((node) => (
        <div key={node.id} className="break-inside-avoid bg-white/60 rounded-xl p-4 shadow-card mb-5">
          <ResponseItem
            node={node}
            category={category}
            date={date}
            savedIds={savedIds}
            onSavedChange={handleSavedChange}
            onPosted={load}
          />
        </div>
      ))}
    </div>
  );
}
