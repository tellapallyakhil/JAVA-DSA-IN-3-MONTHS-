"use client";

import Link from 'next/link';
import { useProgress } from '@/hooks/useProgress';
import topicResourcesData from '@/data/topicResources.json';
import { Target, ArrowRight, Brain, Sparkles, TrendingUp } from 'lucide-react';

interface TopicResource {
    id: string;
    name: string;
    icon: string;
}

const topics = (topicResourcesData as unknown as { topics: { [key: string]: TopicResource } }).topics;

export default function FocusAreasWidget() {
    const { progress, isTopicWeak, isClient } = useProgress();

    if (!isClient) {
        return (
            <div className="glass-card p-6 animate-pulse">
                <div className="h-6 bg-white/10 rounded w-48 mb-4"></div>
                <div className="h-20 bg-white/5 rounded"></div>
            </div>
        );
    }

    const weakTopics = progress.weakTopics || [];
    const topicProgress = progress.topicProgress || {};

    // Get top 4 weak topics to show (for horizontal layout)
    const displayedTopics = weakTopics.slice(0, 4);

    // Calculate overall mastery
    const totalProgress = weakTopics.length > 0
        ? Math.round(
            weakTopics.reduce((sum, topicId) => {
                const tp = topicProgress[topicId];
                const topic = topics[topicId];
                if (!tp || !topic) return sum;
                const totalProblems = (topic as any).levels?.reduce((s: number, l: any) => s + l.problems.length, 0) || 1;
                return sum + (tp.completedProblems.length / totalProblems) * 100;
            }, 0) / weakTopics.length
        )
        : 0;

    return (
        <div className="glass-card p-6 relative overflow-hidden">
            {/* Decorative glows */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

            <div className="relative z-10">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
                            <Target size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">My Focus Areas</h3>
                            <p className="text-sm text-muted-foreground">
                                {weakTopics.length === 0
                                    ? "Mark topics you want to improve"
                                    : `${weakTopics.length} topic${weakTopics.length > 1 ? 's' : ''} in focus`
                                }
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/focus"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-sm font-medium transition-colors"
                    >
                        <Sparkles size={16} />
                        Open Focus Mode
                        <ArrowRight size={14} />
                    </Link>
                </div>

                {weakTopics.length === 0 ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-8 bg-white/5 rounded-xl">
                        <Brain className="text-muted-foreground/30" size={60} />
                        <div className="text-center sm:text-left">
                            <p className="text-lg font-medium mb-1">No focus topics yet</p>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Use Focus Mode to mark topics you're weak in and get personalized learning resources, flashcards, and practice problems.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Overall Progress Card */}
                        <div className="p-4 bg-gradient-to-br from-primary/20 to-purple-500/10 rounded-xl border border-primary/20">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp size={18} className="text-primary" />
                                <span className="text-sm font-medium">Overall Progress</span>
                            </div>
                            <div className="text-3xl font-bold text-primary mb-2">{totalProgress}%</div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all"
                                    style={{ width: `${totalProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                Keep practicing to level up!
                            </p>
                        </div>

                        {/* Topic Cards */}
                        {displayedTopics.map(topicId => {
                            const topic = topics[topicId];
                            const tp = topicProgress[topicId];
                            if (!topic) return null;

                            const topicTotal = (topic as any).levels?.reduce((s: number, l: any) => s + l.problems.length, 0) || 1;
                            const topicPercent = Math.round(((tp?.completedProblems.length || 0) / topicTotal) * 100);

                            return (
                                <Link
                                    key={topicId}
                                    href="/focus"
                                    className="group p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-primary/30 transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">{topic.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{topic.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Level {tp?.currentLevel || 1}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${topicPercent}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-muted-foreground">
                                            {tp?.completedProblems.length || 0}/{topicTotal} done
                                        </span>
                                        <span className="text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            Practice →
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}

                        {/* Show more indicator */}
                        {weakTopics.length > 4 && (
                            <Link
                                href="/focus"
                                className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-primary/30 transition-all flex items-center justify-center"
                            >
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">+{weakTopics.length - 4}</div>
                                    <div className="text-xs text-muted-foreground">more topics</div>
                                </div>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

