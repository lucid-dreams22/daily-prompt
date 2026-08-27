import Link from "next/link";
import { archiveDates, todayStr } from "@/lib/prompts";
export const dynamic = "force-dynamic"; 
export default function ArchivePage() {
  const dates = archiveDates(120);
  const today = todayStr();

  return (
    <div className="fade-in max-w-2xl mx-auto">
      <h1 className="font-display italic text-3xl text-ink mb-1">Archive</h1>
      <p className="text-ink-soft text-sm mb-8">
        Every past day's questions — no account needed to browse or read.
      </p>
      <ul className="divide-y divide-ink/10 border-t border-b border-ink/10">
        {dates.map((date) => {
          const formatted = new Date(date + "T00:00:00Z").toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          });
          return (
            <li key={date}>
              <Link
                href={`/archive/${date}`}
                className="flex items-center justify-between py-3 px-2 hover:bg-white/60 rounded transition-colors"
              >
                <span className="font-mono text-sm text-ink">{formatted}</span>
                {date === today && (
                  <span className="text-xs font-mono uppercase tracking-widest text-gold">Today</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
