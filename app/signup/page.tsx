"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      setError("Username must be 3–20 characters: letters, numbers, or underscores.");
      return;
    }
    setSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    setSubmitting(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      router.push("/");
    } else {
      setNotice("Check your email to confirm your account, then log in.");
    }
  }

  return (
    <div className="fade-in max-w-sm mx-auto mt-8">
      <h1 className="font-display italic text-3xl text-ink mb-6">Sign up</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-widest text-ink-soft/70">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white/70 p-2.5 text-sm outline-none focus:bg-white"
          />
        </div>
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
            minLength={6}
            className="mt-1 w-full rounded-lg border border-ink/15 bg-white/70 p-2.5 text-sm outline-none focus:bg-white"
          />
        </div>
        {error && <p className="text-sm text-rust">{error}</p>}
        {notice && <p className="text-sm text-teal">{notice}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink text-paper rounded-full py-2.5 text-sm font-medium hover:bg-ink-soft transition-colors disabled:opacity-50"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="text-sm text-ink-soft mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-gold underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
