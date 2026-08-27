import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthProvider";
import Navbar from "@/components/Navbar";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex",
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Daily Prompt",
  description: "Three new questions every day. Reflect, imagine, discover — and see how everyone answers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-body min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">{children}</main>
          <footer className="text-center text-sm text-ink-soft/70 py-8 font-mono">
            🍁 Daily Prompt — a new question every day.
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
