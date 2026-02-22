"use client";

import { motion } from 'framer-motion';
import {
    ShieldCheck, Zap, Target, BookOpen,
    Code2, BrainCircuit, Activity, Sparkles,
    LayoutDashboard, History, Cpu, Globe
} from 'lucide-react';

const features = [
    {
        title: "90-Day Engineering Pipeline",
        description: "A high-precision, 3-month trajectory designed to take you from basic syntax to FAANG-ready problem solving. Every day is architected for maximum growth.",
        icon: Target,
        color: "text-primary",
        bgColor: "bg-primary/10"
    },
    {
        title: "1-4-7 Spaced Repetition",
        description: "Built-in algorithmic revision system. We prompt you to revisit concepts on Day 1, Day 4, and Day 7 to move knowledge into long-term memory.",
        icon: History,
        color: "text-amber-400",
        bgColor: "bg-amber-400/10"
    },
    {
        title: "14 Structural Patterns",
        description: "Stop memorizing solutions. We teach you the 14 core patterns (Sliding Window, Two Pointers, etc.) that underlie 99% of technical interview questions.",
        icon: Code2,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10"
    },
    {
        title: "AI Interview Simulator",
        description: "Interactive mock interview environment with behavioral and technical tracks. Get real-time feedback and refine your delivery under pressure.",
        icon: Cpu,
        color: "text-purple-400",
        bgColor: "bg-purple-400/10"
    },
    {
        title: "Active Recall Flashcards",
        description: "Every topic features expert-curated interview flashcards focused on high-frequency questions and 'gotchas' that interviewers love.",
        icon: Zap,
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10"
    },
    {
        title: "Visual Progress Tracking",
        description: "Interactive heatmaps and task readiness indicators provide a data-driven view of your consistency throughout the 90-day mission.",
        icon: Activity,
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10"
    }
];

export default function AboutPage() {
    return (
        <div className="relative space-y-24 py-12 overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-30" />
                <div className="absolute bottom-20 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] opacity-20" />
            </div>

            {/* Hero Section */}
            <section className="relative z-10 text-center space-y-6 max-w-3xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <Sparkles size={12} /> The Architecture of Excellence
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-[0.9]"
                >
                    Mastering the <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-primary">Technical Edge.</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-zinc-500 text-sm md:text-base font-medium leading-relaxed"
                >
                    DSAPrep provides a structured, high-performance curriculum for software engineering candidates.
                    We combine proven learning techniques with industry-standard patterns to ensure you master the problem-solving skills needed for top-tier technical interviews.
                </motion.p>
            </section>

            {/* Feature Grid */}
            <section className="relative z-10 max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card p-8 group hover:border-primary/40 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                                <feature.icon size={120} />
                            </div>

                            <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} ${feature.color} flex items-center justify-center mb-6 border border-white/5`}>
                                <feature.icon size={28} />
                            </div>

                            <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-tight group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>

                            <p className="text-sm text-zinc-500 leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Mission Statement / CTA */}
            <section className="relative z-10 max-w-5xl mx-auto px-4 text-center">
                <div className="glass-card p-12 md:p-20 bg-gradient-to-b from-primary/5 to-transparent border-primary/20">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
                            The Path to <span className="text-primary tracking-normal not-italic">Tier-1</span> Status
                        </h2>
                        <p className="text-sm text-zinc-500 leading-relaxed font-medium transition-colors">
                            In the current tech landscape, knowing DSA is the baseline.
                            Efficiency, clean code, and deep pattern recognition are what get you through the gate.
                            Our mission is to equip you with that 1% difference.
                        </p>
                        <div className="flex flex-wrap justify-center gap-8 pt-10 border-t border-white/5">
                            <div className="space-y-1">
                                <div className="text-2xl font-black text-white">90D</div>
                                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Duration</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-black text-white">14+</div>
                                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Patterns</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-2xl font-black text-white">400+</div>
                                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Problems</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
