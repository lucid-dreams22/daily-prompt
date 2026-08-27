import PromptCard from "@/components/PromptCard";
import { CATEGORIES, todayStr } from "@/lib/prompts";
import { getEffectivePrompts } from "@/lib/promptOverrides";

import type { AppProps } from 'next/app';
import { Analytics } from '@vercel/analytics/next';
 
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
 
export default MyApp;


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
      <div className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft/70">{formatted}</p>
        <h1 className="font-display italic text-4xl sm:text-5xl mt-2 text-ink">
          Three questions. One day. 🍂
        </h1>
        <p className="mt-3 text-ink-soft max-w-md mx-auto">
          Answer in 250 words or fewer. No account needed to read — sign up to post your own
          answer, reply to someone else's, or vote on upcoming prompts.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map((cat) => (
          <PromptCard key={cat.slug} category={cat} prompt={prompts[cat.slug]} date={date} />
        ))}
      </div>
    </div>
  );
}
