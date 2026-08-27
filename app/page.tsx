import PromptCard from "@/components/PromptCard";
import { CATEGORIES, todayStr } from "@/lib/prompts";
import { getEffectivePrompts } from "@/lib/promptOverrides";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const date = todayStr();
  const prompts = await getEffectivePrompts(
    CATEGORIES.map((c) => c.slug),
    date
  );
  const formatted = new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="fade-in">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft/70 text-center mb-6">
        {formatted}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => (
          <PromptCard key={cat.slug} category={cat} prompt={prompts[cat.slug]} date={date} />
        ))}
      </div>
    </div>
  );
}
