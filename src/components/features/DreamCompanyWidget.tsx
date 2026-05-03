'use client';

import { useState, useEffect, useMemo } from 'react';
import { useDreamCompany } from '@/context/DreamCompanyContext';
import { getAllCompanies, getProblemsByCompany, getQuestionsByCompany } from '@/lib/api';
import { Target, BrainCircuit, Code2, ChevronDown, Check, X, Building2, Zap, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import StartButton from '@/components/ui/StartButton';

const getCompanyColor = (name: string) => {
    const colors = [
        'bg-blue-500', 'bg-purple-500', 'bg-emerald-500',
        'bg-rose-500', 'bg-amber-500', 'bg-cyan-500',
        'bg-indigo-500', 'bg-orange-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function DreamCompanyWidget() {
    const { dreamCompany, setDreamCompany } = useDreamCompany();
    const [isOpen, setIsOpen] = useState(false);
    const [companies, setCompanies] = useState<string[]>([]);
    const [search, setSearch] = useState('');

    // Stats
    const [stats, setStats] = useState({
        dsaTotal: 0,
        aptitudeTotal: 0,
    });

    useEffect(() => {
        const fetchCompanies = async () => {
            const data = await getAllCompanies();
            setCompanies(data);
        };
        fetchCompanies();
    }, []);

    useEffect(() => {
        const fetchStats = async () => {
            if (dreamCompany) {
                const [dsa, apt] = await Promise.all([
                    getProblemsByCompany(dreamCompany),
                    getQuestionsByCompany(dreamCompany)
                ]);

                setStats({
                    dsaTotal: dsa.length,
                    aptitudeTotal: apt.length,
                });
            }
        };
        fetchStats();
    }, [dreamCompany]);

    const filteredCompanies = useMemo(() => {
        return companies.filter(c =>
            c.toLowerCase().includes(search.toLowerCase())
        );
    }, [companies, search]);

    return (
        <div className="glass-card p-6 relative transition-all group/widget border-white/5 hover:border-white/10">
            {/* Background Decorative Gradients clipped to the card */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit]">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:bg-primary/20 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -ml-32 -mb-32 group-hover:bg-blue-500/10 transition-all duration-700" />
            </div>

            <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center p-0.5">
                                <div className="w-full h-full rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                                    <Target size={22} className="animate-pulse" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">
                                Dream Company <span className="text-primary">Focus</span>
                            </h2>
                        </div>
                        <p className="text-muted-foreground text-sm max-w-md">
                            Tailor your preparation journey for specific hiring patterns and top asked questions.
                        </p>
                    </div>

                    {/* Company Selector */}
                    <div className="relative">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsOpen(!isOpen)}
                            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 w-full lg:w-72 justify-between group/btn ${isOpen
                                ? 'bg-white/10 ring-2 ring-primary/40'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10 shadow-lg shadow-black/20'
                                }`}
                        >
                            <div className="flex items-center gap-3 truncate">
                                {dreamCompany ? (
                                    <>
                                        <div className={`w-6 h-6 rounded-md ${getCompanyColor(dreamCompany)} flex items-center justify-center text-[10px] font-bold text-white shadow-sm`}>
                                            {dreamCompany.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-white truncate">
                                            {dreamCompany}
                                        </span>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-3 text-white/50">
                                        <Building2 size={18} />
                                        <span className="font-medium">Select Target Company</span>
                                    </div>
                                )}
                            </div>
                            <ChevronDown
                                size={18}
                                className={`text-white/40 group-hover/btn:text-white/70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                            />
                        </motion.button>

                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute top-full right-0 mt-3 w-full lg:w-[400px] bg-[#0d0e12] backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-[100] overflow-hidden flex flex-col"
                                >
                                    <div className="p-4 border-b border-white/5 bg-white/5">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search company or industry..."
                                                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 placeholder:text-white/20"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="max-h-[400px] overflow-y-auto p-2 custom-scrollbar">
                                        <button
                                            onClick={() => {
                                                setDreamCompany(null);
                                                setIsOpen(false);
                                                setSearch('');
                                            }}
                                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-rose-500/10 text-rose-400 group/clear transition-all mb-2 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-rose-500/10 rounded-lg group-hover/clear:bg-rose-500/20 transition-colors">
                                                    <X size={14} />
                                                </div>
                                                <span className="text-sm font-medium">Clear Focus</span>
                                            </div>
                                            <span className="text-[10px] uppercase tracking-widest opacity-0 group-hover/clear:opacity-50 transition-opacity">Reset Path</span>
                                        </button>

                                        <div className="grid grid-cols-1 gap-1">
                                            {filteredCompanies.map(company => (
                                                <button
                                                    key={company}
                                                    onClick={() => {
                                                        setDreamCompany(company);
                                                        setIsOpen(false);
                                                        setSearch('');
                                                    }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group/item ${dreamCompany === company
                                                        ? 'bg-primary/20 text-white border border-primary/30'
                                                        : 'hover:bg-white/5 text-white/60 hover:text-white border border-transparent'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg ${getCompanyColor(company)} flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-black/20 group-hover/item:scale-110 transition-transform`}>
                                                            {company.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-semibold">{company}</span>
                                                            <span className="text-[10px] opacity-40 group-hover/item:opacity-70">Interview Track</span>
                                                        </div>
                                                    </div>
                                                    {dreamCompany === company ? (
                                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                            <Check size={12} className="text-white" />
                                                        </div>
                                                    ) : (
                                                        <ChevronDown size={14} className="-rotate-90 opacity-0 group-hover/item:opacity-30 transition-all group-hover/item:translate-x-1" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>

                                        {filteredCompanies.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                                    <Building2 className="text-white/20" size={24} />
                                                </div>
                                                <p className="text-sm text-white/40 font-medium">No results for "{search}"</p>
                                                <p className="text-[10px] text-white/20 mt-1">Try another keyword or browse all</p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Dashboard Content */}
                <AnimatePresence mode="wait">
                    {dreamCompany ? (
                        <motion.div
                            key="dashboard"
                            initial="hidden"
                            animate="show"
                            variants={{
                                hidden: { opacity: 0 },
                                show: {
                                    opacity: 1,
                                    transition: {
                                        staggerChildren: 0.1
                                    }
                                }
                            }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4"
                        >
                            {/* DSA Card */}
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                            >
                                <Link href={`/company/${dreamCompany}`} className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all hover:bg-blue-500/5 cursor-pointer h-full relative overflow-hidden block">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-blue-500/20 transition-all" />
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 border border-blue-500/20">
                                            <Code2 size={24} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-300 bg-blue-500/10 px-2 py-1 rounded-md">DSA</span>
                                    </div>
                                    <div className="text-3xl font-bold mb-1">{stats.dsaTotal}</div>
                                    <div className="text-xs text-muted-foreground font-medium">Curated Problems</div>
                                    <div className="mt-4 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "5%" }}
                                            transition={{ duration: 1, delay: 0.5 }}
                                            className="bg-blue-500 h-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        />
                                    </div>
                                </Link>
                            </motion.div>

                            {/* Aptitude Card */}
                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                            >
                                <Link href={`/company/${encodeURIComponent(dreamCompany)}/quiz`} className="group p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all hover:bg-purple-500/5 cursor-pointer h-full relative overflow-hidden block">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-purple-500/20 transition-all" />
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-2.5 bg-purple-500/20 rounded-xl text-purple-400 border border-purple-500/20">
                                            <BrainCircuit size={24} />
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300 bg-purple-500/10 px-2 py-1 rounded-md">Quiz</span>
                                    </div>
                                    <div className="text-3xl font-bold mb-1">{stats.aptitudeTotal}</div>
                                    <div className="text-xs text-muted-foreground font-medium">Practice Questions</div>
                                    <div className="mt-4 w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "2%" }}
                                            transition={{ duration: 1, delay: 0.7 }}
                                            className="bg-purple-500 h-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                        />
                                    </div>
                                </Link>
                            </motion.div>

                            <motion.div
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
                            >
                                <Link href={`/interview?company=${encodeURIComponent(dreamCompany)}`} className="block h-full">
                                    <motion.div
                                        whileHover={{ scale: 1.02, y: -5 }}
                                        className="p-5 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 flex flex-col justify-center items-center text-center gap-3 group cursor-pointer h-full relative overflow-hidden shadow-lg shadow-primary/5"
                                    >
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-1 group-hover:rotate-12 transition-transform shadow-lg shadow-primary/20 ring-1 ring-primary/20">
                                            <Zap size={24} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-base leading-tight text-white">Mock Interview</div>
                                            <p className="text-[11px] text-muted-foreground mt-1 px-4 italic">AI-tailored for {dreamCompany}</p>
                                        </div>
                                        <div className="text-[10px] font-bold text-primary px-3 py-1 bg-primary/10 rounded-full border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all shadow-inner uppercase">Start Now</div>
                                    </motion.div>
                                </Link>
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="text-center py-16 flex flex-col items-center justify-center space-y-8"
                        >
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black uppercase tracking-tighter text-white">Get Started</h2>
                                <p className="text-zinc-500 italic text-sm">Your 90-day plan is ready.</p>
                            </div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-fit"
                            >
                                <StartButton
                                    className="group relative inline-flex items-center justify-center gap-3 bg-primary px-10 py-5 rounded-2xl transition-all shadow-2xl shadow-primary/30 text-white font-black uppercase tracking-widest text-lg"
                                />
                            </motion.div>

                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}

