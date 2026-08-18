import PromptCard from "@/components/PromptCard";
import { CATEGORIES, getPromptForDate, todayStr } from "@/lib/prompts";

export default function HomePage() {
  const date = todayStr();
  const formatted = new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="fade-in">
      <div className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft/70">{formatted}</p>
        <h1 className="font-display italic text-4xl sm:text-5xl mt-2 text-ink">
          Three questions. One day.
        </h1>
        <p className="mt-3 text-ink-soft max-w-md mx-auto">
          Answer in 200 words or fewer. No account needed to read — sign up to post your own
          answer or reply to someone else's.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => (
          <PromptCard key={cat.slug} category={cat} prompt={getPromptForDate(cat.slug, date)} date={date} />
        ))}
      </div>
    </div>
  );
}
