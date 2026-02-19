"use client";

import Link from 'next/link';
import { ArrowRight, Code2, BrainCircuit, Calendar, Zap, Target, Sparkles, Trophy, MousePointer2, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllDays } from '@/lib/api';
import CalendarSection from '@/components/CalendarSection';
import PomodoroTimer from '@/components/PomodoroTimer';
import StudyHeatmap from '@/components/StudyHeatmap';
import InterviewSimulator from '@/components/InterviewSimulator';
import RevisionReminder from '@/components/RevisionReminder';
import StartButton from '@/components/StartButton';
import FocusAreasWidget from '@/components/FocusAreasWidget';
import DreamCompanyWidget from '@/components/DreamCompanyWidget';

export default function Home() {
  const days = getAllDays();

  const stats = [
    { label: "Total Days", value: "90", icon: Calendar },
    { label: "DSA Problems", value: "400+", icon: Code2 },
    { label: "Aptitude Questions", value: "200+", icon: BrainCircuit },
    { label: "Flashcards", value: "100+", icon: Zap },
  ];

  const months = [
    {
      id: 1,
      title: "Foundation & Core",
      focus: "Arrays, Strings, Basic Math, Logical Reasoning",
      color: "from-blue-500/20 to-cyan-500/10",
      weeks: "Week 1-4",
      topics: ["Arrays & Hashing", "Two Pointers", "Sliding Window", "Stack", "Binary Search", "Linked Lists"]
    },
    {
      id: 2,
      title: "Advanced DSA",
      focus: "Trees, Graphs, DP, Verbal Ability",
      color: "from-purple-500/20 to-pink-500/10",
      weeks: "Week 5-8",
      topics: ["Trees & BST", "Heap", "Backtracking", "Graphs", "Dynamic Programming"]
    },
    {
      id: 3,
      title: "Interview Preparation",
      focus: "Mock Tests, Pattern Revision, Hard Problems",
      color: "from-amber-500/20 to-orange-500/10",
      weeks: "Week 9-12",
      topics: ["System Design", "Company Focus", "Mock Interviews", "Final Sprint"]
    },
  ];

  return (
    <div className="relative space-y-24 pb-20 overflow-x-hidden">
      {/* Premium Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Architectural Background Grid */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[100px] opacity-30" />
      </div>

      <RevisionReminder />

      {/* Technical Engineering Hero Section */}
      <section className="relative pt-12 md:pt-24 border-b border-white/5 overflow-hidden">
        {/* Architectural Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] -z-10" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-[#020205] to-[#020205] -z-10" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10 py-12">
            {/* System Status Log */}
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Current Pipeline</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-1.5 w-1.5 bg-primary animate-pulse" />
                  <span className="text-xs font-mono text-zinc-500 uppercase">SYS-090: ACTIVE_ROADMAP</span>
                </div>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block" />
              <div className="flex flex-col hidden sm:flex">
                <span className="text-[10px] font-black tracking-[0.3em] text-zinc-600 uppercase">Target Readiness</span>
                <span className="text-xs font-mono text-emerald-500 uppercase mt-1">99.8% Optimized</span>
              </div>
            </div>

            {/* Main Heading: Structural & Clean */}
            <div className="space-y-4 px-4 md:px-0 text-center md:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-7xl font-black tracking-tighter leading-none text-white uppercase italic">
                The 90-Day <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Engineering</span> <br />
                Pipeline.
              </h1>
              <p className="max-w-xl text-zinc-500 text-sm md:text-lg font-medium leading-relaxed border-l-0 md:border-l-2 border-primary/20 pl-0 md:pl-6 py-2">
                A high-precision curriculum for data structures, algorithmic synchronization, and quantitative logic. Designed for specialists.
              </p>
            </div>

            {/* Execution Actions */}
            <div className="flex flex-col sm:flex-row gap-6">
              <StartButton className="px-10 py-5 bg-primary text-white font-black text-lg rounded-none transition-all shadow-[8px_8px_0px_0px_rgba(100,80,250,0.3)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-[0.98] flex items-center justify-center gap-4" />

              <Link href="#calendar" className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black text-lg rounded-none hover:bg-white/10 transition-all flex items-center justify-center gap-4 group">
                <span className="w-2 h-2 bg-zinc-700 group-hover:bg-white transition-colors" />
                ROADMAP_VIEW
              </Link>
            </div>

            {/* Data Stats Footer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 opacity-40 hover:opacity-100 transition-opacity duration-500">
              <div>
                <div className="text-xl font-black text-white">400+</div>
                <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">DSA_UNITS</div>
              </div>
              <div>
                <div className="text-xl font-black text-white">200+</div>
                <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">QUANT_UNITS</div>
              </div>
              <div>
                <div className="text-xl font-black text-white">90</div>
                <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">CYCLES</div>
              </div>
              <div>
                <div className="text-xl font-black text-white">24/7</div>
                <div className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">UPTIME</div>
              </div>
            </div>
          </div>

          {/* Right Side: Engineering Visualization */}
          <div className="relative hidden lg:block">
            <div className="aspect-square bg-[#050510] border border-white/10 p-12 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
              {/* Fake Code Block Visual */}
              <div className="space-y-6 font-mono text-[11px] text-zinc-700 leading-relaxed overflow-hidden italic">
                <div className="text-primary font-black opacity-40"># INITIALIZING_ENV...</div>
                <div>while (current_day &lt; 90) &#123;</div>
                <div className="pl-6">master_dsa(current_topic);</div>
                <div className="pl-6 text-purple-400">solve_aptitude(daily_logic);</div>
                <div className="pl-6 text-emerald-500 font-bold">// SECURING_PLACEMENT...</div>
                <div className="pl-6">revision_cycle(1, 4, 7);</div>
                <div className="pl-6">current_day++;</div>
                <div>&#125;</div>
                <div className="text-zinc-400 pt-4 cursor-default">| STATUS: 100%_CODE_SYNCED</div>
              </div>
              {/* Floating HUD info */}
              <div className="absolute bottom-8 right-8 border border-primary/20 bg-black/80 px-4 py-2 text-[10px] font-black text-primary tracking-widest uppercase">
                System_Core v3.2
              </div>
            </div>
            {/* Visual Depth Decoration */}
            <div className="absolute -z-10 -bottom-12 -right-12 w-full h-full border border-white/5 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-6 text-center">
            <stat.icon className="mx-auto mb-3 text-primary" size={28} />
            <div className="text-3xl font-black">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* DREAM COMPANY WIDGET */}
      <DreamCompanyWidget />


      {/* Routine Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-8 flex items-start gap-4">
          <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400">
            <Code2 size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">2 Hours Java + DSA</h3>
            <p className="text-muted-foreground leading-relaxed">Master Data Structures, Algorithms, and Core Java concepts through daily structured problem sets.</p>
            <ul className="mt-4 space-y-1 text-sm text-blue-300/80">
              <li>• Work Days: 3 problems (1 Easy, 1 Medium, 1 Hard)</li>
              <li>• Holidays: 6 problems (3 Easy, 2 Medium, 1 Hard)</li>
            </ul>
          </div>
        </div>
        <div className="glass-card p-8 flex items-start gap-4">
          <div className="bg-purple-500/20 p-3 rounded-lg text-purple-400">
            <BrainCircuit size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">2 Hours Aptitude</h3>
            <p className="text-muted-foreground leading-relaxed">Sharpen your logical reasoning, quantitative, and verbal aptitude for initial screening rounds.</p>
            <ul className="mt-4 space-y-1 text-sm text-purple-300/80">
              <li>• Daily MCQ quizzes with instant feedback</li>
              <li>• Detailed explanations for each answer</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Spaced Repetition Rule */}
      <section className="glass-card p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="p-1.5 bg-green-500/20 rounded-md text-green-400"><Lightbulb size={20} /></span>
            The 1-4-7 Revision Rule
          </h2>
          <div className="grid md:grid-cols-[2fr,1fr] gap-6 items-center">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                To move concepts from short-term to long-term memory, we strictly follow the
                <span className="text-white font-bold"> Spaced Repetition</span> method.
                Never forget a concept again by following this review schedule:
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">1</div>
                  <div className="text-sm">
                    <span className="block font-bold text-white">Day 1</span>
                    <span className="text-white/60">Learn Concept</span>
                  </div>
                </div>
                <div className="text-muted-foreground self-center">→</div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">4</div>
                  <div className="text-sm">
                    <span className="block font-bold text-white">Day 4</span>
                    <span className="text-white/60">First Review</span>
                  </div>
                </div>
                <div className="text-muted-foreground self-center">→</div>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">7</div>
                  <div className="text-sm">
                    <span className="block font-bold text-white">Day 7</span>
                    <span className="text-white/60">Final Mastery</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-black/20 p-4 rounded-xl border border-white/5 text-sm space-y-2">
              <div className="font-bold text-green-400 mb-2">Why it works?</div>
              <p className="text-white/70">The brain forgets 40% of new info within 24 hours.</p>
              <p className="text-white/70">Reviewing at specific intervals resets the "Forgetting Curve" and strengthens neural connections.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Months Overview */}
      <section>
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-2"><Target className="text-primary" /> The 3-Month Plan</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {months.map(m => (
            <div key={m.id} className={`p-6 rounded-2xl border border-white/5 bg-gradient-to-br ${m.color} flex flex-col justify-between min-h-[220px]`}>
              <div>
                <div className="text-4xl font-black text-white/10">0{m.id}</div>
                <h3 className="text-xl font-bold mb-1">{m.title}</h3>
                <p className="text-sm text-white/60 mb-3">{m.weeks}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {m.topics.map(t => (
                  <span key={t} className="text-[10px] bg-white/10 px-2 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Calendar View */}
      <CalendarSection days={days} />

      {/* Feature Grid */}
      <section className="space-y-8 py-8">
        <h2 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <span className="p-2 bg-purple-500/20 rounded-lg text-purple-400">🚀</span>
          Study Tools
        </h2>
        <div className="space-y-8">
          {/* Focus Areas - Full Width on Top */}
          <FocusAreasWidget />

          {/* Heatmap and Interview Simulator side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <StudyHeatmap />
            <InterviewSimulator />
          </div>
        </div>
      </section>

      {/* Quick Start CTA */}
      <section className="glass-card p-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-4">Ready to Begin Your Journey?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Commit to 4 hours daily for 90 days and transform your coding & aptitude skills. Your dream placement awaits!
          </p>
          <StartButton className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)]">
            Start Today <ArrowRight />
          </StartButton>
        </div>
      </section>

      <PomodoroTimer />
    </div>
  );
}
