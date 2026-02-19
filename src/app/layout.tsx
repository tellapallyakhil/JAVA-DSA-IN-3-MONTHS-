import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { Github, Linkedin, Mail } from 'lucide-react';
import Providers from '@/components/Providers';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "90-Day DSA Prep | Master Java & Aptitude",
  description: "A structured 3-month placement preparation plan for coding interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col`}
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main className="pt-24 px-6 md:px-12 max-w-7xl mx-auto pb-12 w-full flex-grow">
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
        </Providers>
      </body>
    </html>
  );
}
