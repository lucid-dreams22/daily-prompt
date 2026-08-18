import Link from "next/link";
import type { Category } from "@/lib/prompts";

const colorClasses: Record<string, { border: string; text: string; bg: string }> = {
  rust: { border: "border-rust", text: "text-rust", bg: "bg-rust" },
  teal: { border: "border-teal", text: "text-teal", bg: "bg-teal" },
  indigo: { border: "border-indigo", text: "text-indigo", bg: "bg-indigo" },
};

export default function PromptCard({
  category,
  prompt,
  date,
}: {
  category: Category;
  prompt: string;
  date: string;
}) {
  const c = colorClasses[category.color];
  return (
    <Link
      href={`/prompt/${category.slug}/${date}`}
      className={`group block bg-white/60 hover:bg-white rounded-2xl border-t-4 ${c.border} shadow-card p-6 transition-all hover:-translate-y-0.5`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className={`font-mono text-xs uppercase tracking-widest ${c.text}`}>
          {category.name}
        </span>
        <span className={`w-2 h-2 rounded-full ${c.bg}`} />
      </div>
      <p className="font-display text-xl leading-snug text-ink">{prompt}</p>
      <p className="mt-4 text-sm text-ink-soft group-hover:underline">
        Read responses &amp; add yours →
      </p>
    </Link>
  );
}
