"use client";

import { useState, useEffect } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { getAllDays, getAllProblems } from '@/lib/api';
import { PieChart, ListChecks, Brain, RotateCcw, Award, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Problem, DailyTask } from '@/types';

export default function ProgressPage() {
    const { progress, isClient } = useProgress();
    const [allDays, setAllDays] = useState<DailyTask[]>([]);
    const [allProblems, setAllProblems] = useState<Problem[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [days, problems] = await Promise.all([
                    getAllDays(),
                    getAllProblems()
                ]);
                setAllDays(days);
                setAllProblems(problems);
            } catch (err) {
                console.error("Failed to load progress data", err);
            } finally {
                setLoadingData(false);
            }
        };
        load();
    }, []);

    if (!isClient || loadingData) return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <div className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Syncing Progress Data...</div>
        </div>
    );

    const totalProblems = allProblems.length;
    const solvedProblems = progress.completedProblems.length;
    const dsaPercentage = totalProblems ? Math.round((solvedProblems / totalProblems) * 100) : 0;

    const totalDays = allDays.length;
    const aptitudeDone = progress.aptitudeDone.length;
    const reasoningDone = progress.reasoningDone.length;

    const aptitudePercentage = totalDays ? Math.round((aptitudeDone / totalDays) * 100) : 0;
    const reasoningPercentage = totalDays ? Math.round((reasoningDone / totalDays) * 100) : 0;

    const overallPercentage = Math.round((dsaPercentage + aptitudePercentage + reasoningPercentage) / 3);

    return (
        <div className="space-y-12 animate-in fade-in duration-500 pb-20">
            <div className="text-center space-y-4">
                <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-2">
                    <Award size={32} />
                </div>
                <h1 className="text-4xl font-bold">Your Progress Dashboard</h1>
                <p className="text-muted-foreground">Track your consistency and growth across all domains.</p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
                <div className="glass-card p-6 flex flex-col items-center justify-center gap-4 border-primary/20 bg-primary/5 min-h-[200px]">
                    <div className="relative flex items-center justify-center">
                        <svg className="w-32 h-32 transform -rotate-90">
                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                            <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * overallPercentage) / 100} className="text-primary transition-all duration-1000 ease-out" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-white">{overallPercentage}%</div>
                    </div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Total Completion</div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-2">
                        <Link href="/day/1" className="text-xs bg-primary/20 hover:bg-primary/30 px-3 py-1.5 rounded-full transition-colors">
                            Continue Learning
                        </Link>
                        <Link href="/topics" className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors">
                            Browse Topics
                        </Link>
                    </div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-2 text-blue-400 font-bold">
                        <PieChart size={20} /> DSA Problems
                    </div>
                    <div className="text-3xl font-bold">{solvedProblems} <span className="text-sm text-muted-foreground">/ {totalProblems}</span></div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full transition-all duration-1000 ease-out" style={{ width: `${dsaPercentage}%` }} />
                    </div>
                    <div className="text-xs text-right text-blue-400">{dsaPercentage}% Done</div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-2 text-purple-400 font-bold">
                        <Brain size={20} /> Aptitude Days
                    </div>
                    <div className="text-3xl font-bold">{aptitudeDone} <span className="text-sm text-muted-foreground">/ {totalDays}</span></div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-500 h-full transition-all duration-1000 ease-out" style={{ width: `${aptitudePercentage}%` }} />
                    </div>
                    <div className="text-xs text-right text-purple-400">{aptitudePercentage}% Done</div>
                </div>

                <div className="glass-card p-6 flex flex-col justify-center space-y-4">
                    <div className="flex items-center gap-2 text-pink-400 font-bold">
                        <ListChecks size={20} /> Reasoning Days
                    </div>
                    <div className="text-3xl font-bold">{reasoningDone} <span className="text-sm text-muted-foreground">/ {totalDays}</span></div>
                    <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div className="bg-pink-500 h-full transition-all duration-1000 ease-out" style={{ width: `${reasoningPercentage}%` }} />
                    </div>
                    <div className="text-xs text-right text-pink-400">{reasoningPercentage}% Done</div>
                </div>
            </div>

            {/* Revision List */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2"><RotateCcw /> Completed Problems <span className="text-sm font-normal text-muted-foreground ml-2">(Ready for Revision)</span></h2>
                {solvedProblems === 0 ? (
                    <div className="glass p-8 rounded-xl text-center text-muted-foreground border-dashed border-white/10">
                        No problems solved yet. Go to <Link href="/day/1" className="text-primary underline">Day 1</Link> to start!
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allProblems.filter(p => progress.completedProblems.includes(p.id)).map(p => (
                            <Link href={`/day/${allDays.find(d => d.javaDSA.problems.includes(p.id))?.day || 1}`} key={p.id} className="glass p-4 rounded-xl flex items-center justify-between group hover:border-green-500/30 transition-all">
                                <span className="font-semibold group-hover:text-green-400 transition-colors">{p.title}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded ${p.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                                    p.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                        'bg-red-500/10 text-red-400'
                                    }`}>{p.difficulty}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
