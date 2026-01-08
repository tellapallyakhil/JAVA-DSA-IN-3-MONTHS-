"use client";

import { useProgress } from '@/hooks/useProgress';
import { RevisionItem } from '@/types';
import { Brain, Check, Clock, RefreshCw, Sparkles, BookOpen, Code } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function RevisionReminder() {
    const { getRevisionsDueToday, markRevisionDone, progress, isClient } = useProgress();

    if (!isClient) return null;

    const dueItems = getRevisionsDueToday();
    const upcomingItems = (progress.revisionItems || []).filter(
        item => !dueItems.some(d => d.id === item.id)
    ).slice(0, 3);

    if (dueItems.length === 0 && upcomingItems.length === 0) {
        return null;
    }

    const getRevisionLabel = (item: RevisionItem) => {
        if (item.revisionsDone === 0) return "1st Revision (Day 4)";
        if (item.revisionsDone === 1) return "2nd Revision (Day 7)";
        return "Final Revision";
    };

    const getDaysUntil = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(dateStr);
        const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    return (
        <div className="glass-card p-6 mb-8 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                    <Brain size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        1-4-7 Revision System
                        <Sparkles size={16} className="text-amber-400" />
                    </h3>
                    <p className="text-xs text-muted-foreground">Spaced repetition for long-term memory</p>
                </div>
            </div>

            {/* Due Today */}
            {dueItems.length > 0 && (
                <div className="mb-4">
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <RefreshCw size={12} />
                        Due Today ({dueItems.length})
                    </div>
                    <div className="space-y-2">
                        <AnimatePresence>
                            {dueItems.map(item => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: 50 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20"
                                >
                                    <div className="flex items-center gap-3">
                                        {item.type === 'problem' ? (
                                            <Code size={16} className="text-blue-400" />
                                        ) : (
                                            <BookOpen size={16} className="text-green-400" />
                                        )}
                                        <div>
                                            <div className="font-medium text-sm">{item.title}</div>
                                            <div className="text-[10px] text-amber-400">{getRevisionLabel(item)}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => markRevisionDone(item.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        <Check size={14} />
                                        Done
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Upcoming Revisions */}
            {upcomingItems.length > 0 && (
                <div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Clock size={12} />
                        Upcoming Revisions
                    </div>
                    <div className="space-y-2">
                        {upcomingItems.map(item => {
                            const daysUntil = getDaysUntil(item.nextRevisionDate);
                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        {item.type === 'problem' ? (
                                            <Code size={16} className="text-blue-400/50" />
                                        ) : (
                                            <BookOpen size={16} className="text-green-400/50" />
                                        )}
                                        <div>
                                            <div className="font-medium text-sm text-zinc-400">{item.title}</div>
                                            <div className="text-[10px] text-muted-foreground">{getRevisionLabel(item)}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Info */}
            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="text-xs text-muted-foreground">
                    <strong className="text-white">How it works:</strong> When you complete a problem, it's added to revision.
                    You'll be reminded to revise on <span className="text-amber-400">Day 4</span> and <span className="text-amber-400">Day 7</span>.
                    After both revisions, the topic is considered <span className="text-green-400">mastered</span>!
                </div>
            </div>
        </div>
    );
}
