"use client";

import { useState } from "react";
import { useAuth } from "@/lib/AuthProvider";
import { supabase } from "@/lib/supabaseClient";
import ResponseForm from "./ResponseForm";
import type { CategorySlug } from "@/lib/prompts";

export interface ResponseNode {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  username: string;
  children: ResponseNode[];
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ResponseItem({
  node,
  category,
  date,
  depth = 0,
  savedIds,
  onSavedChange,
  onPosted,
}: {
  node: ResponseNode;
  category: CategorySlug;
  date: string;
  depth?: number;
  savedIds: Set<string>;
  onSavedChange: (id: string, saved: boolean) => void;
  onPosted: () => void;
}) {
  const { user } = useAuth();
  const [replying, setReplying] = useState(false);
  const isSaved = savedIds.has(node.id);

  async function toggleSave() {
    if (!user) return;
    if (isSaved) {
      await supabase.from("saved_responses").delete().eq("user_id", user.id).eq("response_id", node.id);
      onSavedChange(node.id, false);
    } else {
      await supabase.from("saved_responses").insert({ user_id: user.id, response_id: node.id });
      onSavedChange(node.id, true);
    }
  }

  return (
    <div className={depth > 0 ? "mt-3 pl-4 border-l-2 border-ink/10" : ""}>
      <div className="text-sm">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-ink">{node.username}</span>
          <span className="font-mono text-xs text-ink-soft/60">{timeAgo(node.created_at)}</span>
        </div>
        <p className="text-ink-soft mt-1 whitespace-pre-wrap leading-relaxed">{node.content}</p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => setReplying((r) => !r)}
            className="text-xs font-medium text-ink-soft hover:text-gold transition-colors"
          >
            {replying ? "Cancel" : "Reply"}
          </button>
          {user && (
            <button
              onClick={toggleSave}
              className={`text-xs font-medium transition-colors ${isSaved ? "text-gold" : "text-ink-soft hover:text-gold"}`}
            >
              {isSaved ? "★ Saved" : "☆ Save"}
            </button>
          )}
        </div>
        {replying && (
          <ResponseForm
            category={category}
            date={date}
            parentId={node.id}
            compact
            onPosted={() => {
              setReplying(false);
              onPosted();
            }}
            onCancel={() => setReplying(false)}
          />
        )}
      </div>
      {node.children.map((child) => (
        <ResponseItem
          key={child.id}
          node={child}
          category={category}
          date={date}
          depth={depth + 1}
          savedIds={savedIds}
          onSavedChange={onSavedChange}
          onPosted={onPosted}
        />
      ))}
    </div>
  );
}
