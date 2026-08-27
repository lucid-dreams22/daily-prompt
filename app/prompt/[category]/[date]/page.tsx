import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORY_MAP, getPromptForDate, todayStr, type CategorySlug } from "@/lib/prompts";
import SavePromptButton from "@/components/SavePromptButton";
import PromptInteractive from "@/components/PromptInteractive";

const VALID_SLUGS = ["reflect", "imagine", "discover"];

const TEXT_COLOR: Record<string, string> = {
  rust: "text-rust",
  teal: "text-teal",
  indigo: "text-indigo",
};
export const dynamic = "force-dynamic"; 
export default function PromptPage({
  params,
}: {
  params: { category: string; date: string };
}) {
  const { category, date } = params;
  if (!VALID_SLUGS.includes(category) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    notFound();
  }
  const slug = category as CategorySlug;
  const cat = CATEGORY_MAP[slug];
  const prompt = getPromptForDate(slug, date);
  const isToday = date === todayStr();
  const isFuture = date > todayStr();
  if (isFuture) notFound();

  const formatted = new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="fade-in max-w-3xl mx-auto">
      <Link href="/archive" className="text-xs font-mono text-ink-soft/70 hover:text-gold">
        ← Archive
      </Link>

      <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
        <span className={`font-mono text-xs uppercase tracking-widest ${TEXT_COLOR[cat.color]}`}>
          {cat.name} · {isToday ? "Today" : formatted}
        </span>
        <SavePromptButton category={slug} date={date} />
      </div>

      <h1 className="font-display text-3xl sm:text-4xl leading-snug mt-3 text-ink">{prompt}</h1>

      <PromptInteractive category={slug} date={date} />
    </div>
  );
}
