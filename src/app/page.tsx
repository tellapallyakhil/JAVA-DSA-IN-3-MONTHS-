import Link from 'next/link';
import { ArrowRight, Code2, BrainCircuit, Calendar, Zap, Target } from 'lucide-react';
import { getAllDays } from '@/lib/api';
import CalendarSection from '@/components/CalendarSection';
import PomodoroTimer from '@/components/PomodoroTimer';
import StudyHeatmap from '@/components/StudyHeatmap';
import InterviewSimulator from '@/components/InterviewSimulator';
import RevisionReminder from '@/components/RevisionReminder';
import StartButton from '@/components/StartButton';
import FocusAreasWidget from '@/components/FocusAreasWidget';

export default function Home() {
  const days = getAllDays();

  const stats = [
    { label: "Total Days", value: "90", icon: Calendar },
    { label: "DSA Problems", value: "270+", icon: Code2 },
    { label: "Aptitude Questions", value: "180+", icon: BrainCircuit },
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
      title: "Advanced Data Structures",
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
    <div className="space-y-16 animate-in fade-in duration-500">
      {/* Revision Reminder - shows if there are items due */}
      <RevisionReminder />

      {/* Hero */}
      <section className="text-center space-y-6 pt-6 md:pt-10 px-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Placement Ready in 90 Days
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-transparent pb-2">
          Master DSA & <br className="hidden sm:block" /><span className="sm:hidden"> </span>Aptitude Together.
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
          A structured 3-month roadmap dedicating 2 hours to Java+DSA and 2 hours to Aptitude daily.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4">
          <StartButton />
          <Link href="#calendar" className="w-full sm:w-auto border border-white/20 hover:border-white/40 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2">
            View Calendar
          </Link>
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
            <span className="p-1.5 bg-green-500/20 rounded-md text-green-400">🧠</span>
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
