"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Hash, ArrowLeftRight, AppWindow, Layers, Search, Link2,
    TreePine, Network, Brain, Undo2, Trophy, Zap, Binary,
    CalendarDays, ChevronDown, ChevronUp, ExternalLink,
    Lightbulb, Sparkles, Target, Flame, CheckCircle2
} from "lucide-react";
import { useEffect } from "react";
import { getAllProblems } from "@/lib/api";
import { Problem } from "@/types";

// Dynamic Icon Map
const iconMap: Record<string, React.ElementType> = {
    hash: Hash,
    arrows: ArrowLeftRight,
    window: AppWindow,
    layers: Layers,
    search: Search,
    link: Link2,
    tree: TreePine,
    network: Network,
    brain: Brain,
    undo: Undo2,
    trophy: Trophy,
    zap: Zap,
    binary: Binary,
    calendar: CalendarDays,
};

const difficultyConfig: Record<string, { color: string; bg: string }> = {
    Easy: { color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/20" },
    Medium: { color: "text-amber-400", bg: "bg-amber-500/15 border-amber-500/20" },
    Hard: { color: "text-red-400", bg: "bg-red-500/15 border-red-500/20" },
};

export default function PatternsPage() {
    const [patterns, setPatterns] = useState<any[]>([]);
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedPattern, setExpandedPattern] = useState<string | null>(null);
    const [filterDifficulty, setFilterDifficulty] = useState<string>("All");

    useEffect(() => {
        const loadData = async () => {
            try {
                const [patternsData, problemsData] = await Promise.all([
                    import("@/data/patterns.json").then(m => m.default),
                    getAllProblems()
                ]);
                setPatterns(patternsData);
                setProblems(problemsData);
            } catch (err) {
                console.error("Failed to load patterns data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const togglePattern = (id: string) => {
        setExpandedPattern(expandedPattern === id ? null : id);
    };

    const getProblemsForPattern = (problemIds: string[]) => {
        return problemIds
            .map((id) => problems.find((p) => p.id === id))
            .filter(Boolean) as Problem[];
    };

    const filteredPatternsWithCounts = patterns.map((pattern) => {
        const patternProblems = pattern.problemIds
            .map((id: string) => problems.find((p) => String(p.id) === String(id)))
            .filter(Boolean) as Problem[];

        const filtered =
            filterDifficulty === "All"
                ? patternProblems
                : patternProblems.filter((p) => p.difficulty === filterDifficulty);
        return { ...pattern, problems: filtered, totalProblems: patternProblems.length };
    });

    return (
        <div className="relative space-y-10 pb-20">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[10%] left-[-5%] w-[35%] h-[35%] bg-primary/15 rounded-full blur-[120px] opacity-40" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-600/15 rounded-full blur-[100px] opacity-30" />
                <div className="absolute top-[50%] left-[50%] w-[25%] h-[25%] bg-cyan-600/10 rounded-full blur-[80px] opacity-20" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-4 pb-8 border-b border-white/5">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:40px_40px] -z-10" />

                <div className="space-y-6">
                    {/* System Tag */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black tracking-[0.3em] text-primary uppercase">Pattern Recognition</span>
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-mono text-zinc-500 uppercase">SYS: PATTERN_ENGINE_v2</span>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <div className="space-y-3">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-none text-white uppercase">
                                Pattern-Wise{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">
                                    Problems
                                </span>
                            </h1>
                            <p className="max-w-2xl text-zinc-500 text-sm md:text-base font-medium leading-relaxed border-l-2 border-primary/20 pl-4">
                                Stop solving random problems. Master the <span className="text-white font-bold">14 core patterns</span> that cover 90% of all coding interview questions. Each pattern unlocks a family of problems.
                            </p>
                        </div>

                        {/* Stats Box */}
                        <div className="flex gap-4 shrink-0">
                            <div className="bg-white/5 border border-white/10 px-5 py-3 text-center min-w-[100px]">
                                <div className="text-2xl font-black text-white">
                                    {loading ? "..." : patterns.length}
                                </div>
                                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Patterns</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 px-5 py-3 text-center min-w-[100px]">
                                <div className="text-2xl font-black text-primary">
                                    {loading ? "..." : patterns.reduce((acc: number, p: any) => acc + p.problemIds.length, 0)}
                                </div>
                                <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Problems</div>
                            </div>
                        </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mr-2">Filter:</span>
                        {["All", "Easy", "Medium", "Hard"].map((d) => (
                            <button
                                key={d}
                                onClick={() => setFilterDifficulty(d)}
                                className={`text-xs font-bold px-4 py-2 border transition-all uppercase tracking-wider ${filterDifficulty === d
                                    ? "bg-primary/20 border-primary/40 text-primary"
                                    : "bg-white/5 border-white/10 text-zinc-500 hover:text-white hover:border-white/20"
                                    }`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pattern Cards Grid */}
            <section className="relative z-10 space-y-4">
                {loading ? (
                    // Skeleton Loader
                    [1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="bg-white/[0.02] border border-white/[0.06] p-6 flex items-center gap-6 animate-pulse">
                            <div className="hidden sm:block w-10 h-10 bg-zinc-800 rounded" />
                            <div className="w-14 h-14 bg-zinc-800 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-5 bg-zinc-800 rounded w-1/4" />
                                <div className="h-4 bg-zinc-800 rounded w-3/4" />
                            </div>
                            <div className="w-20 h-8 bg-zinc-800 rounded hidden lg:block" />
                            <div className="w-5 h-5 bg-zinc-800 rounded" />
                        </div>
                    ))
                ) : (
                    filteredPatternsWithCounts.map((pattern, index) => {
                        const Icon = iconMap[pattern.icon] || Hash;
                        const isExpanded = expandedPattern === pattern.id;
                        const gradientColors = pattern.color;

                        return (
                            <motion.div
                                key={pattern.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group"
                            >
                                {/* Pattern Card Header */}
                                <button
                                    onClick={() => togglePattern(pattern.id)}
                                    className={`w-full text-left transition-all duration-300 border ${isExpanded
                                        ? "bg-white/[0.06] border-primary/30 shadow-[0_0_40px_-15px_rgba(124,58,237,0.3)]"
                                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04] hover:border-white/10"
                                        }`}
                                >
                                    <div className="p-5 md:p-6 flex items-center gap-4 md:gap-6">
                                        {/* Pattern Number */}
                                        <div className="hidden sm:flex w-10 h-10 items-center justify-center text-lg font-black text-zinc-700">
                                            {String(index + 1).padStart(2, "0")}
                                        </div>

                                        {/* Icon */}
                                        <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 bg-gradient-to-br ${gradientColors} rounded-lg flex items-center justify-center shadow-lg`}>
                                            <Icon className="text-white" size={24} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg md:text-xl font-black text-white truncate">
                                                    {pattern.title}
                                                </h3>
                                                <span className="text-[10px] font-bold text-zinc-600 bg-white/5 px-2 py-0.5 border border-white/10 shrink-0">
                                                    {pattern.problems.length} / {pattern.totalProblems}
                                                </span>
                                            </div>
                                            <p className="text-xs md:text-sm text-zinc-500 line-clamp-1 md:line-clamp-2">
                                                {pattern.description}
                                            </p>
                                        </div>

                                        {/* Difficulty Distribution Mini-Bar */}
                                        <div className="hidden lg:flex items-center gap-2 shrink-0">
                                            {["Easy", "Medium", "Hard"].map((d) => {
                                                const count = pattern.problemIds
                                                    .map((id: string) => problems.find((p) => String(p.id) === String(id)))
                                                    .filter((p: any) => p && p.difficulty === d).length;
                                                const config = difficultyConfig[d];
                                                return (
                                                    <div key={d} className={`text-[10px] font-bold px-2 py-1 border ${config.bg} ${config.color}`}>
                                                        {count}{d[0]}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Expand/Collapse Icon */}
                                        <div className="shrink-0 text-zinc-600 group-hover:text-primary transition-colors">
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </div>
                                    </div>
                                </button>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="border border-t-0 border-primary/20 bg-black/30 backdrop-blur-sm">
                                                {/* Tip Box */}
                                                <div className="px-6 pt-5 pb-3">
                                                    <div className="flex items-start gap-3 bg-primary/5 border border-primary/15 p-4">
                                                        <Lightbulb size={18} className="text-primary shrink-0 mt-0.5" />
                                                        <div>
                                                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Pro Tip</span>
                                                            <p className="text-sm text-zinc-400 mt-1">{pattern.tip}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Problem List */}
                                                <div className="px-6 pb-6">
                                                    {pattern.problems.length === 0 ? (
                                                        <div className="text-center py-8 text-zinc-600 text-sm">
                                                            No {filterDifficulty} problems in this pattern. Try changing the filter.
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2 mt-2">
                                                            {/* Table Header */}
                                                            <div className="grid grid-cols-[1fr_80px_1fr_40px] md:grid-cols-[2fr_100px_1fr_50px] gap-3 px-4 py-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest border-b border-white/5">
                                                                <span>Problem</span>
                                                                <span>Difficulty</span>
                                                                <span className="hidden md:block">Companies</span>
                                                                <span className="text-center">Link</span>
                                                            </div>

                                                            {pattern.problems.map((problem: Problem, pIndex: number) => {
                                                                const config = difficultyConfig[problem.difficulty];
                                                                return (
                                                                    <motion.div
                                                                        key={problem.id}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ delay: pIndex * 0.03 }}
                                                                        className="grid grid-cols-[1fr_80px_1fr_40px] md:grid-cols-[2fr_100px_1fr_50px] gap-3 px-4 py-3 items-center bg-white/[0.02] hover:bg-white/[0.05] border border-transparent hover:border-white/5 transition-all group/row"
                                                                    >
                                                                        {/* Problem Title */}
                                                                        <div className="flex items-center gap-3 min-w-0">
                                                                            <span className="text-[10px] font-mono text-zinc-700 w-5 shrink-0">
                                                                                {String(pIndex + 1).padStart(2, "0")}
                                                                            </span>
                                                                            <span className="text-sm font-semibold text-zinc-300 group-hover/row:text-white truncate transition-colors">
                                                                                {problem.title}
                                                                            </span>
                                                                        </div>

                                                                        {/* Difficulty Badge */}
                                                                        <div>
                                                                            <span className={`text-[10px] font-bold px-2.5 py-1 border ${config.bg} ${config.color}`}>
                                                                                {problem.difficulty}
                                                                            </span>
                                                                        </div>

                                                                        {/* Companies */}
                                                                        <div className="hidden md:flex items-center gap-1 overflow-hidden">
                                                                            {problem.companies.slice(0, 3).map((c: string) => (
                                                                                <span
                                                                                    key={c}
                                                                                    className="text-[9px] font-medium bg-white/5 border border-white/10 px-2 py-0.5 text-zinc-500 truncate"
                                                                                >
                                                                                    {c}
                                                                                </span>
                                                                            ))}
                                                                            {problem.companies.length > 3 && (
                                                                                <span className="text-[9px] text-zinc-600">
                                                                                    +{problem.companies.length - 3}
                                                                                </span>
                                                                            )}
                                                                        </div>

                                                                        {/* Link */}
                                                                        <div className="text-center">
                                                                            <a
                                                                                href={problem.link}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="inline-flex items-center justify-center w-8 h-8 bg-white/5 hover:bg-primary/20 hover:text-primary text-zinc-600 transition-all border border-white/5 hover:border-primary/30"
                                                                            >
                                                                                <ExternalLink size={14} />
                                                                            </a>
                                                                        </div>
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
                )}
            </section>

            {/* Bottom CTA */}
            <section className="relative z-10 bg-white/[0.02] border border-white/[0.06] p-8 md:p-10 text-center">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5" />
                <div className="relative z-10 space-y-4">
                    <Flame className="mx-auto text-primary" size={32} />
                    <h2 className="text-2xl font-black text-white uppercase">Master the Patterns, Crack Any Interview</h2>
                    <p className="text-zinc-500 max-w-xl mx-auto text-sm">
                        Every coding interview question is built on these patterns. Once you learn them, you can solve any variant thrown at you.
                    </p>
                    <div className="flex items-center justify-center gap-4 pt-2">
                        <Link
                            href="/topics"
                            className="px-8 py-3 bg-primary text-white font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-all shadow-[4px_4px_0px_0px_rgba(124,58,237,0.3)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                        >
                            Browse Topics
                        </Link>
                        <Link
                            href="/compiler"
                            className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold text-sm uppercase tracking-wider hover:bg-white/10 transition-all"
                        >
                            Open Compiler
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
