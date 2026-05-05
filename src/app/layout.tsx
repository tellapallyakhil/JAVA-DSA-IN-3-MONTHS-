import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import { Github, Linkedin, Mail, Info } from 'lucide-react';
import Link from "next/link";
import PomodoroTimer from "@/components/features/PomodoroTimer";
import Providers from '@/components/layout/Providers';
import "./globals.css";

// System font stack used as fallback to avoid build-time network errors
const sansFont = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif";
const monoFont = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace";

export const metadata: Metadata = {
  title: {
    default: "90-Day DSA Roadmap: Master Java & Placement Interviews (Free Guide)",
    template: "%s | DSAPrep"
  },
  description: "Master Data Structures and Algorithms in 3 months with our structured Java DSA Roadmap. Perfect for FAANG and campus placement preparation. Free, pattern-based learning guide.",
  keywords: [
    "DSA", "Java", "Data Structures", "Algorithms", "Coding Interview Prep",
    "Placement Training", "90 Day Challenge", "Software Engineering",
    "learn DSA in Java", "DSA roadmap", "DSA preparation plan",
    "campus placement preparation", "placement interview questions",
    "coding interview patterns", "FAANG interview prep",
    "LeetCode patterns", "top 100 DSA questions", "DSA for beginners",
    "competitive programming Java", "problem solving techniques",
    "TCS NQT preparation", "Infosys DSA questions", "Wipro coding test",
    "Accenture coding assessment", "Cognizant GenC preparation",
    "Java data structures tutorial", "algorithm practice Java",
    "binary search problems", "dynamic programming questions",
    "graph algorithms Java", "tree traversal problems",
    "sliding window technique", "two pointers pattern",
    "backtracking problems", "greedy algorithm examples",
    "linked list interview questions", "stack and queue problems",
    "sorting algorithms Java", "recursion problems Java",
    "time complexity analysis", "space complexity optimization",
    "online Java compiler", "Java code executor",
    "mock interview practice", "AI interview simulator",
    "spaced repetition learning", "DSA flashcards",
    "90 days DSA challenge", "3 month DSA plan",
    "Java DSA in 3 months", "master DSA Java"
  ],
  authors: [{ name: "Tellapalli Akhil Kumar" }],
  creator: "Tellapalli Akhil Kumar",
  publisher: "Tellapalli Akhil Kumar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "90-Day DSA Roadmap | Master Java & Placement Prep",
    description: "Structured, systematic approach to master Data Structures and Algorithms in 90 days. Free pattern-based learning for students.",
    url: "https://java-dsa-in-3-months.vercel.app",
    siteName: "DSAPrep",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "90-Day DSA Roadmap | Free Placement Guide",
    description: "Master Java, DSA, and Interview Skills in 3 Months with our structured roadmap.",
    creator: "@tellapallyakhil",
    images: ["/og-image.png"], // Placeholder for futuristic preview image
  },
  alternates: {
    canonical: "https://java-dsa-in-3-months.vercel.app",
  },
  verification: {
    google: "google-site-verification-id", // Placeholder
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col"
        style={{ fontFamily: sansFont }}
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main className="pt-24 px-6 md:px-12 max-w-7xl mx-auto pb-24 w-full flex-grow">
            {children}
          </main>

          <footer className="py-6 text-center text-xs text-muted-foreground/60 border-t border-white/5 backdrop-blur-sm flex flex-col items-center gap-2">
            <p className="font-medium text-primary/80">Greetings & Thank you for visiting my web</p>
            <p>Made by Tellapalli Akhil kumar</p>
            <div className="flex items-center gap-4 mt-1">
              <a
                href="mailto:tellapallyakhil89@gmail.com"
                className="text-muted-foreground hover:text-red-400 transition-colors p-1"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
              <a
                href="https://www.linkedin.com/in/tellapalli-akhil-kumar-188a0028a"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-blue-400 transition-colors p-1"
                aria-label="LinkedIn"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="https://github.com/tellapallyakhil"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-white transition-colors p-1"
                aria-label="GitHub"
              >
                <Github size={16} />
              </a>
            </div>
          </footer>

          {/* Floating About Link - Left Bottom */}
          <Link
            href="/about"
            className="fixed bottom-6 left-6 z-[40] group flex items-center gap-2 px-3 py-3 md:px-4 md:py-2 bg-zinc-900/80 hover:bg-primary/10 border border-white/10 hover:border-primary/40 rounded-full backdrop-blur-xl transition-all shadow-2xl active:scale-95"
          >
            <div className="relative flex items-center justify-center">
              <Info size={16} className="text-primary group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
            <span className="text-[10px] font-black text-zinc-400 group-hover:text-white transition-colors tracking-[0.2em] uppercase hidden md:inline">About_Sys</span>
          </Link>

          {/* Global Pomodoro Timer */}
          <PomodoroTimer />
        </Providers>
      </body>
    </html>
  );
}

