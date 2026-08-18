"use client";

import { useState } from "react";
import ResponseForm from "./ResponseForm";
import ResponseWaterfall from "./ResponseWaterfall";
import type { CategorySlug } from "@/lib/prompts";

export default function PromptInteractive({ category, date }: { category: CategorySlug; date: string }) {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <>
      <div className="mt-6 border-t border-ink/10 pt-6">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mb-2">
          Your response
        </h2>
        <ResponseForm category={category} date={date} onPosted={() => setRefreshKey((k) => k + 1)} />
      </div>

      <div className="border-t border-ink/10 mt-8 pt-2">
        <h2 className="font-mono text-xs uppercase tracking-widest text-ink-soft/70 mt-4">
          Everyone's responses
        </h2>
        <ResponseWaterfall key={refreshKey} category={category} date={date} />
      </div>
    </>
  );
}
