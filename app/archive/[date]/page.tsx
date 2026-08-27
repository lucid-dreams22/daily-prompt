import Link from "next/link";
import { notFound } from "next/navigation";
import PromptCard from "@/components/PromptCard";
import { CATEGORIES, EPOCH, todayStr } from "@/lib/prompts";
import { getEffectivePrompts } from "@/lib/promptOverrides";

export default async function ArchiveDayPage({ params }: { params: { date: string } }) {
  const { date } = params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();
  if (date > todayStr() || date < EPOCH) notFound();

  const prompts = await getEffectivePrompts(
    CATEGORIES.map((c) => c.slug),
    date
  );

  const formatted = new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="fade-in">
      <Link href="/archive" className="text-xs font-mono text-ink-soft/70 hover:text-gold">
        ← Archive
      </Link>
      <h1 className="font-display italic text-3xl sm:text-4xl mt-3 mb-8 text-ink">{formatted}</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => (
          <PromptCard key={cat.slug} category={cat} prompt={prompts[cat.slug]} date={date} />
        ))}
      </div>
    </div>
  );
}
