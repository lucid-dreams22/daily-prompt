"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push("/");
  }

  return (
    <div className="fade-in max-w-sm mx-auto mt-8">
      <h1 className="font-display italic text-3xl text-ink mb-6">Log in</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-ink-soft/70">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white/70 p-2.5 text-sm outline-none focus:bg-white"
          />
        </div>
        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-ink-soft/70">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white/70 p-2.5 text-sm outline-none focus:bg-white"
          />
        </div>
        {error && <p className="text-sm text-rust">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink text-paper rounded-full py-2.5 text-sm font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="text-sm text-ink-soft mt-6">
        No account yet?{" "}
        <Link href="/signup" className="text-gold underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
