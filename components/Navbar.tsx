"use client";

import Link from "next/link";
import { useAuth } from "@/lib/AuthProvider";

export default function Navbar() {
  const { user, loading, signOut } = useAuth();

  return (
    <header className="border-b border-ink/10 bg-paper/80 backdrop-blur sticky top-0 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display italic text-2xl font-semibold text-ink">
          Daily Prompt
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/archive" className="hover:text-gold transition-colors">
            Archive
          </Link>
          {!loading && user && (
            <Link href="/saved" className="hover:text-gold transition-colors">
              Saved
            </Link>
          )}
          {!loading && !user && (
            <>
              <Link href="/login" className="hover:text-gold transition-colors">
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-ink text-paper px-4 py-2 rounded-full hover:bg-ink-soft transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
          {!loading && user && (
            <button
              onClick={() => signOut()}
              className="bg-ink text-paper px-4 py-2 rounded-full hover:bg-ink-soft transition-colors"
            >
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
