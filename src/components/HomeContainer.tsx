"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowRight, Code2, BrainCircuit, Calendar,
    Target, Sparkles, Trophy, ChevronRight,
    LayoutDashboard, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllDays } from '@/lib/api';
import { DailyTask } from '@/types';
import CalendarSection from '@/components/CalendarSection';
import PomodoroTimer from '@/components/PomodoroTimer';
import StudyHeatmap from '@/components/StudyHeatmap';
import InterviewSimulator from '@/components/InterviewSimulator';
import RevisionReminder from '@/components/RevisionReminder';
import StartButton from '@/components/StartButton';
import FocusAreasWidget from '@/components/FocusAreasWidget';
import DreamCompanyWidget from '@/components/DreamCompanyWidget';

export default function HomeContainer() {
    const [days, setDays] = useState<DailyTask[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDays = async () => {
            try {
                const data = await getAllDays();
                setDays(data);
            } catch (error) {
                console.error("Failed to fetch days:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDays();
    }, []);

    const stats = [
        { label: "DSA", value: "400+", icon: Code2, color: "text-blue-400" },
        { label: "Quant", value: "1000+", icon: BrainCircuit, color: "text-purple-400" },
        { label: "Cycles", value: "90", icon: Calendar, color: "text-emerald-400" },
    ];

    return (
        <div className="relative space-y-12 pb-20 overflow-x-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] opacity-30" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] opacity-20" />
            </div>

            {/* 1. COMPACT CONTROL CENTER (HERO + STATS) */}
            <section className="relative pt-6 md:pt-12 px-4 z-40">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-[1.4fr,1fr] gap-8 items-stretch">
                        {/* Left: Action Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8 md:p-12 relative overflow-hidden group border-primary/20 bg-gradient-to-br from-[#080810] to-black"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <LayoutDashboard size={180} />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] uppercase text-white">
                                    90-Day <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary">Placement Prep.</span>
                                </h1>
                                <p className="max-w-md text-zinc-500 text-sm font-medium leading-relaxed">
                                    A structured trajectory for DSA mastery and technical interview success. Follow the plan, solve the problems, and secure your dream role.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <StartButton className="px-8 py-4 bg-primary text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 flex items-center gap-3" />
                                    <Link href="#calendar" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-white/10 transition-all flex items-center gap-3 group">
                                        Roadmap <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="glass p-6 rounded-3xl border border-white/5 flex flex-col justify-between hover:border-white/10 transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-white">{stat.value}</div>
                                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                </motion.div>
                            ))}
                            <RevisionReminder compact />
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. CORE PERFORMANCE WIDGETS */}
            <section className="px-4 max-w-7xl mx-auto space-y-8 relative z-30">
                <FocusAreasWidget />

                <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-8">
                    <StudyHeatmap />
                    <DreamCompanyWidget />
                </div>
            </section>

            {/* 3. MASTERY FRAMEWORK (THE METHODOLOGY) */}
            <section className="px-4 max-w-7xl mx-auto relative z-20">
                <div className="glass-card p-10 relative overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tight">The Framework.</h2>
                            <p className="text-sm text-zinc-500">How we turn knowledge into mastery.</p>
                        </div>
                        <div className="h-px flex-1 bg-white/5 mx-8 hidden md:block" />
                        <div className="bg-primary/20 text-primary text-[10px] font-black px-4 py-1.5 rounded-full border border-primary/30 uppercase tracking-[0.2em]">
                            Precision Training
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
                        {/* Rule 1-4-7 */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-center md:justify-start gap-3 text-amber-400">
                                <RefreshCw size={20} className="animate-spin-slow" />
                                <h3 className="font-black uppercase text-sm tracking-wider">Spaced Repetition</h3>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed italic">
                                Reset the "Forgetting Curve" by reviewing on days 1, 4, and 7.
                            </p>
                            <div className="flex justify-center md:justify-start gap-2">
                                {[1, 4, 7].map(n => (
                                    <div key={n} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-zinc-400">{n}</div>
                                ))}
                            </div>
                        </div>

                        {/* Routine */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-center md:justify-start gap-3 text-blue-400">
                                <Target size={20} />
                                <h3 className="font-black uppercase text-sm tracking-wider">The 4-Hour Daily</h3>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed italic">
                                2 hours dedicated to DSA depth + 2 hours for Aptitude logic.
                            </p>
                            <div className="flex items-center justify-center md:justify-start gap-3 text-[10px] font-black">
                                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-md border border-blue-500/20">2H DSA</span>
                                <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-md border border-purple-500/20">2H QUANT</span>
                            </div>
                        </div>

                        {/* Strategy */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-center md:justify-start gap-3 text-emerald-400">
                                <Trophy size={20} />
                                <h3 className="font-black uppercase text-sm tracking-wider">Placement Phase</h3>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed italic">
                                Tier-based progression from Basic Foundations to FAANG Hard.
                            </p>
                            <Link href="#calendar" className="text-[10px] font-black text-emerald-400 hover:text-white transition-colors flex items-center justify-center md:justify-start gap-1 uppercase tracking-widest">
                                Explore Roadmap <ArrowRight size={12} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. INTERACTIVE SIMULATOR */}
            <section className="px-4 max-w-7xl mx-auto relative z-10">
                <InterviewSimulator />
            </section>

            {/* 5. LOGIC PATTERNS & QUICK START */}
            <section className="px-4 max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-stretch relative z-10">
                <div className="glass-card p-10 bg-[#0a0a0f] border-white/10 relative overflow-hidden group">
                    <div className="relative z-10 space-y-6">
                        <div className="p-3 bg-primary/20 rounded-2xl w-fit text-primary">
                            <Sparkles size={24} />
                        </div>
                        <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter">
                            Problem Solving <br />
                            <span className="text-primary">Patterns.</span>
                        </h2>
                        <p className="text-sm text-zinc-500 leading-relaxed">
                            Master the 14 core patterns that solve thousands of different interview questions efficiently.
                        </p>
                        <Link href="/patterns" className="inline-flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:border-primary transition-all active:scale-95 shadow-xl shadow-black/40">
                            Explore Patterns <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>

                <div className="glass-card p-10 bg-gradient-to-br from-primary/10 to-transparent border-white/5 flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                    <div className="space-y-3">
                        <h3 className="text-2xl font-bold uppercase tracking-tighter text-white">Get Started</h3>
                        <p className="text-xs text-zinc-500 font-medium italic">Your 90-day plan is ready.</p>
                    </div>
                    <StartButton className="w-full max-w-xs py-5 bg-primary text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-1 active:scale-95 text-sm" />
                </div>
            </section>

            {/* 6. FULL ROADMAP */}
            <section id="calendar" className="pt-12 relative z-10">
                <CalendarSection days={days} />
            </section>
        </div>
    );
}
