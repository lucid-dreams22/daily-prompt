// The three daily categories. Each has a bank of prompts that rotates
// deterministically by date, so "today's prompt" needs no cron job or
// database write — it's computed the same way on every server and client.

export type CategorySlug = "reflect" | "imagine" | "discover";

export interface Category {
  slug: CategorySlug;
  name: string;
  tagline: string;
  color: string; // tailwind color token name
}

export const CATEGORIES: Category[] = [
  {
    slug: "reflect",
    name: "Reflect",
    tagline: "A question about your own life",
    color: "rust",
  },
  {
    slug: "imagine",
    name: "Imagine",
    tagline: "A hypothetical worth sitting with",
    color: "teal",
  },
  {
    slug: "discover",
    name: "Discover",
    tagline: "A question about the wider world",
    color: "indigo",
  },
];

export const CATEGORY_MAP: Record<CategorySlug, Category> = {
  reflect: CATEGORIES[0],
  imagine: CATEGORIES[1],
  discover: CATEGORIES[2],
};

// The day the rotation begins. Day 0 = this date's prompt is bank[0].
export const EPOCH = "2025-01-01";

const REFLECT: string[] = [
  "What's a small habit that quietly improved your life?",
  "What would you tell yourself from exactly one year ago?",
  "What's something you believed strongly and later changed your mind about?",
  "When did you last feel truly proud of yourself, and why?",
  "What's a rule you live by that most people would disagree with?",
  "What does 'home' mean to you right now?",
  "What's something you're avoiding that you know you should face?",
  "Who influenced you the most, and what did they teach you without knowing it?",
  "What's a compliment you received that you still think about?",
  "What does a good day actually look like for you, hour by hour?",
  "What's something you used to be embarrassed about that you now appreciate?",
  "If you had to give up one convenience forever, what would you keep?",
  "What's a boundary you've learned to set that changed how you live?",
  "What's the most useful thing failure ever taught you?",
  "What does your inner critic usually say, and is it right?",
  "What's a tradition you'd like to start?",
  "When do you feel most like yourself?",
  "What's something you've forgiven yourself for?",
  "What's a decision that felt small but changed everything?",
  "What are you quietly grateful for today that you'd usually overlook?",
  "What's a fear you've outgrown?",
  "What's the kindest thing someone has done for you without being asked?",
  "What would your younger self be surprised to learn about your life now?",
  "What's something you do differently than your parents did, on purpose?",
  "What's a piece of advice you give often but struggle to follow yourself?",
  "What does rest actually look like for you, versus what you think it should look like?",
  "What's a relationship that shaped who you are, for better or worse?",
  "What's something you're still learning about yourself?",
  "What would you do differently if no one was watching?",
  "What's a version of success that has nothing to do with money?",
];

const IMAGINE: string[] = [
  "If you could instantly master one skill with zero practice, what would you choose and why?",
  "If every person could read one book's worth of your thoughts, which would you want it to be?",
  "If you woke up with an extra 3 hours a day, no strings attached, what would change first?",
  "If your city disappeared and you had to design its replacement, what's the first thing you'd build?",
  "If you could send one object to the past to change nothing but delight someone, what would it be?",
  "If animals could hold one human job for a day, which pairing would be the most chaotic?",
  "If you had to live one year with no internet, what would you miss least?",
  "If you could ask one question to anyone who ever lived and get a true answer, who and what?",
  "If your life had a soundtrack for this week, what's one track on it?",
  "If money vanished as a concept tomorrow, what would people compete for instead?",
  "If you could permanently swap one of your senses for a new one, what would the new sense be?",
  "If you had to teach a class with zero preparation tomorrow, what would you teach?",
  "If you could live inside one decade of history for a year, which would you pick?",
  "If your house could talk, what would it complain about most?",
  "If you had to leave one message to be discovered in 100 years, what would it say?",
  "If everyone had to have a personal motto tattooed somewhere, what's yours?",
  "If you could redesign one everyday object that annoys you, what would you fix?",
  "If you had to trade your career for any other job for a month, what would you pick?",
  "If a stranger found your bag right now, what would they assume about you?",
  "If you could give one piece of technology to your childhood self, what would it be?",
  "If your life were a genre of film, what genre, and what's the twist?",
  "If you could only keep three apps on your phone forever, which would survive?",
  "If you had to move to a country where you don't speak the language, how would you cope?",
  "If you could ask your future self one question and get an honest answer, what would you ask?",
  "If you had unlimited budget for one weekend, no logistics allowed to get in the way, what would you do?",
  "If you could make one law that everyone had to follow for a day, what would it be?",
  "If your pet (real or imagined) could talk for five minutes, what would they finally tell you?",
  "If you had to describe your personality using only foods, what's the menu?",
  "If you could remove one minor daily annoyance from existence forever, what goes first?",
  "If you had to start a business tomorrow with $100, what would you try?",
];

const DISCOVER: string[] = [
  "What's a scientific fact that still feels unbelievable to you?",
  "What's a place you've never been but feel strangely drawn to?",
  "What's a historical event you wish you understood better?",
  "What's a skill that used to be common but is rare today?",
  "What's something everyone around you seems to know that you don't?",
  "What's a piece of technology from your childhood that's completely gone now?",
  "What's a word in another language that has no direct English translation?",
  "What's a cultural tradition you find beautiful even though it's not yours?",
  "What's an animal whose behavior genuinely surprised you when you learned about it?",
  "What's something small that changed how an entire industry works?",
  "What's a myth or misconception you believed for way too long?",
  "What's a everyday object with a surprisingly interesting origin story?",
  "What's something people 100 years from now might find shocking about how we live?",
  "What's a question science still can't fully answer?",
  "What's a book, article, or documentary that rearranged how you see something?",
  "What's a food you'd never heard of that turned out to be a favorite?",
  "What's a law of nature that feels almost poetic to you?",
  "What's a job that existed a century ago but doesn't exist anymore?",
  "What's a current event you think people will still be discussing in 50 years?",
  "What's something small you can do that has an outsized effect on the world?",
  "What's a place on Earth that sounds almost fictional but is real?",
  "What's a subject you wish had been taught in school?",
  "What's an invention you think was ahead of its time?",
  "What's something about the ocean, space, or the underground world that fascinates you?",
  "What's a language or dialect you'd love to learn, and why that one?",
  "What's a piece of art or music that changed how an entire era thought?",
  "What's a number or statistic that reframed how you see the world?",
  "What's a tradition from another culture you think more people should adopt?",
  "What's something in nature that solves a problem better than humans have?",
  "What's a historical figure whose reputation you think is completely wrong?",
];

const BANKS: Record<CategorySlug, string[]> = {
  reflect: REFLECT,
  imagine: IMAGINE,
  discover: DISCOVER,
};

/** Days between EPOCH and the given YYYY-MM-DD date string (UTC, so it's stable everywhere). */
export function dayIndexForDate(dateStr: string): number {
  const epoch = new Date(EPOCH + "T00:00:00Z").getTime();
  const day = new Date(dateStr + "T00:00:00Z").getTime();
  const diffDays = Math.floor((day - epoch) / (1000 * 60 * 60 * 24));
  return diffDays;
}

/** Returns today's date as YYYY-MM-DD in UTC. */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Get the prompt text for a category on a given date. */
export function getPromptForDate(category: CategorySlug, dateStr: string): string {
  const bank = BANKS[category];
  let idx = dayIndexForDate(dateStr) % bank.length;
  if (idx < 0) idx += bank.length;
  return bank[idx];
}

/** All dates that have a "real" prompt (from EPOCH through today), most recent first. */
export function archiveDates(limit = 60): string[] {
  const today = todayStr();
  const todayIdx = dayIndexForDate(today);
  const dates: string[] = [];
  for (let i = 0; i <= Math.min(todayIdx, limit - 1); i++) {
    const d = new Date(EPOCH + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() + (todayIdx - i));
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export function wordCount(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export const MAX_WORDS = 250;
