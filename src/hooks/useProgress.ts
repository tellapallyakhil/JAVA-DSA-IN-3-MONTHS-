"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Progress } from '@/types';

const STORAGE_KEY = 'dsa_tracker_progress_v1';

const defaultProgress: Progress = {
    completedDays: [],
    completedProblems: [],
    completedQuestions: [],
    aptitudeDone: [],
    reasoningDone: [],
    activityDates: [],
    revisionItems: []
};

// Helper function to get today's date string
function getTodayString(): string {
    return new Date().toISOString().split('T')[0];
}

// Helper to calculate streak from activity dates
export function calculateStreak(activityDates: string[]): { current: number; longest: number } {
    if (!activityDates || activityDates.length === 0) {
        return { current: 0, longest: 0 };
    }

    // Sort dates in descending order (most recent first)
    const sortedDates = [...new Set(activityDates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const today = getTodayString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);

    // Check if there's activity today or yesterday to start the streak
    if (sortedDates[0] === today || sortedDates[0] === yesterdayString) {
        for (const dateStr of sortedDates) {
            const expectedDate = checkDate.toISOString().split('T')[0];
            if (dateStr === expectedDate) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else if (dateStr < expectedDate) {
                break;
            }
        }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 1;
    const ascDates = sortedDates.reverse();

    for (let i = 1; i < ascDates.length; i++) {
        const prevDate = new Date(ascDates[i - 1]);
        const currDate = new Date(ascDates[i]);
        const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            tempStreak++;
        } else if (diffDays > 1) {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return { current: currentStreak, longest: longestStreak };
}

export function useProgress() {
    const [progress, setProgress] = useState<Progress>(defaultProgress);
    const [isClient, setIsClient] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // 1. Initialize logic: Check Auth -> Load Cloud if User -> Load Local if Guest
    useEffect(() => {
        setIsClient(true);

        const init = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            if (session?.user) {
                // Load from Supabase
                const { data, error } = await supabase
                    .from('profiles')
                    .select('progress')
                    .eq('id', session.user.id)
                    .single();

                if (data && data.progress) {
                    setProgress(data.progress);
                } else {
                    // If no cloud data, maybe sync local to cloud? Or just start fresh. 
                    // Let's assume start fresh or use what we have in memory if we merged (not doing specific merge logic now for simplicity)
                }
            } else {
                // Load from LocalStorage
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        // Merge with defaults to ensure all fields exist (handles migration)
                        setProgress({ ...defaultProgress, ...parsed });
                    } catch (e) {
                        console.error("Failed to parse progress", e);
                    }
                }
            }
            setLoading(false);
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                // Re-fetch on login
                const { data } = await supabase.from('profiles').select('progress').eq('id', session.user.id).single();
                if (data?.progress) setProgress(data.progress);
            } else {
                // Reset to local on logout or clear
                // Ideally we might keep the local state or reload page.
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // 2. Save logic: If User -> Save Cloud. Always Save Local as backup/cache.
    useEffect(() => {
        if (!isClient || loading) return;

        // Always save local
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

        // If logged in, save to cloud debounce?
        // For simplicity, we save immediately. In prod, use debounce.
        if (user) {
            const saveToCloud = async () => {
                // Upsert profile
                const { error } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        progress: progress,
                        updated_at: new Date().toISOString()
                    });
                if (error) console.error("Error saving to supabase", error);
            };
            saveToCloud();
        }

    }, [progress, isClient, user, loading]);


    // Helper to add today's date to activity
    const recordActivity = (prev: Progress): string[] => {
        const today = getTodayString();
        const dates = prev.activityDates || [];
        if (!dates.includes(today)) {
            return [...dates, today];
        }
        return dates;
    };

    // Actions
    const toggleProblem = (id: string) => {
        setProgress(prev => {
            const exists = prev.completedProblems.includes(id);
            return {
                ...prev,
                completedProblems: exists
                    ? prev.completedProblems.filter(p => p !== id)
                    : [...prev.completedProblems, id],
                activityDates: exists ? prev.activityDates : recordActivity(prev)
            };
        });
    };

    const toggleAptitude = (day: number) => {
        setProgress(prev => {
            const exists = prev.aptitudeDone.some(a => a.day === day);
            return {
                ...prev,
                aptitudeDone: exists
                    ? prev.aptitudeDone.filter(a => a.day !== day)
                    : [...prev.aptitudeDone, { day, count: 1 }]
            };
        });
    };

    const toggleReasoning = (day: number) => {
        setProgress(prev => {
            const exists = prev.reasoningDone.some(r => r.day === day);
            return {
                ...prev,
                reasoningDone: exists
                    ? prev.reasoningDone.filter(r => r.day !== day)
                    : [...prev.reasoningDone, { day, count: 1 }]
            };
        });
    };

    const toggleQuestion = (id: string) => {
        setProgress(prev => {
            const questions = prev.completedQuestions || [];
            const exists = questions.includes(id);
            return {
                ...prev,
                completedQuestions: exists
                    ? questions.filter(q => q !== id)
                    : [...questions, id],
                activityDates: exists ? prev.activityDates : recordActivity(prev)
            };
        });
    };

    // 1-4-7 Spaced Repetition Functions
    const addToRevision = (id: string, title: string, type: 'problem' | 'topic') => {
        setProgress(prev => {
            const items = prev.revisionItems || [];
            // Don't add duplicates
            if (items.some(item => item.id === id)) return prev;

            const today = getTodayString();
            const nextRevision = new Date();
            nextRevision.setDate(nextRevision.getDate() + 3); // First revision after 3 days (Day 4)

            return {
                ...prev,
                revisionItems: [...items, {
                    id,
                    type,
                    title,
                    learnedDate: today,
                    revisionsDone: 0,
                    nextRevisionDate: nextRevision.toISOString().split('T')[0]
                }]
            };
        });
    };

    const markRevisionDone = (id: string) => {
        setProgress(prev => {
            const items = prev.revisionItems || [];
            return {
                ...prev,
                revisionItems: items.map(item => {
                    if (item.id !== id) return item;

                    const newRevisionsDone = item.revisionsDone + 1;

                    if (newRevisionsDone >= 2) {
                        // After 2 revisions (day 4 and day 7), item is mastered - remove from list
                        return null;
                    }

                    // Schedule next revision (3 more days for day 7)
                    const nextRevision = new Date();
                    nextRevision.setDate(nextRevision.getDate() + 3);

                    return {
                        ...item,
                        revisionsDone: newRevisionsDone,
                        nextRevisionDate: nextRevision.toISOString().split('T')[0]
                    };
                }).filter(Boolean) as typeof items,
                activityDates: recordActivity(prev)
            };
        });
    };

    const getRevisionsDueToday = () => {
        const today = getTodayString();
        const items = progress.revisionItems || [];
        return items.filter(item => item.nextRevisionDate <= today);
    };

    return {
        progress,
        toggleProblem,
        toggleAptitude,
        toggleReasoning,
        toggleQuestion,
        addToRevision,
        markRevisionDone,
        getRevisionsDueToday,
        isProblemCompleted: (id: string) => progress.completedProblems.includes(id),
        isAptitudeCompleted: (day: number) => progress.aptitudeDone.some(a => a.day === day),
        isReasoningCompleted: (day: number) => progress.reasoningDone.some(r => r.day === day),
        isQuestionCompleted: (id: string) => (progress.completedQuestions || []).includes(id),
        isClient,
        user,
        loading
    };
}
