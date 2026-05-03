"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { Progress } from '@/types';
import { progressSyncQueue } from '@/lib/syncQueue';

const STORAGE_KEY_PREFIX = 'dsa_tracker_progress_';
const GUEST_STORAGE_KEY = 'dsa_tracker_progress_guest';

// Get storage key based on user ID (for user-specific progress)
function getStorageKey(userId?: string): string {
    return userId ? `${STORAGE_KEY_PREFIX}${userId}` : GUEST_STORAGE_KEY;
}

const defaultProgress: Progress = {
    completedDays: [],
    completedProblems: [],
    completedQuestions: [],
    aptitudeDone: [],
    reasoningDone: [],
    activityDates: [],
    revisionItems: [],
    lastUpdated: 0,
    weakTopics: [],
    completedAptitudeTopics: [],
    completedReasoningTopics: [],
    topicProgress: {}
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

    // Check if the most recent activity is today or yesterday
    if (sortedDates.length > 0) {
        const lastActivity = sortedDates[0];

        if (lastActivity === today) {
            let checkDate = new Date(today);
            for (const dateStr of sortedDates) {
                const expectedDate = checkDate.toISOString().split('T')[0];
                if (dateStr === expectedDate) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else if (dateStr < expectedDate) {
                    break;
                }
            }
        } else if (lastActivity === yesterdayString) {
            let checkDate = new Date(yesterday); // Start checking from yesterday
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
    }

    // Calculate longest streak (create a separate copy for ascending order)
    let longestStreak = 0;
    let tempStreak = 1;
    const ascDates = [...sortedDates].reverse(); // Create a copy before reversing

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
    // Add cachedUser state for instant UI updates
    const [cachedUser, setCachedUser] = useState<{ email?: string; id?: string } | null>(null);

    // 1. Initialize logic: Check Auth -> Load Cloud if User -> Load Local if Guest
    useEffect(() => {
        setIsClient(true);

        // Load cached user immediately for fast UI
        const storedUser = localStorage.getItem('dsa_last_user');
        if (storedUser) {
            try {
                setCachedUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse cached user", e);
            }
        }

        const getLocalProgress = (userId?: string): Progress | null => {
            const stored = localStorage.getItem(getStorageKey(userId));
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    return { ...defaultProgress, ...parsed };
                } catch (e) {
                    console.error("Failed to parse progress", e);
                }
            }
            return null;
        };

        const init = async () => {
            try {
                // Add timeout to Supabase call to prevent hanging
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Supabase timeout')), 3000)
                );

                const sessionPromise = supabase.auth.getSession();

                const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
                const session = result?.data?.session;

                setUser(session?.user ?? null);

                let cloudProgress: Progress | null = null;
                let localProgress: Progress | null = null;

                // 1. Get Local Data
                localProgress = getLocalProgress(session?.user?.id);
                
                // OPTIMIZATION: If we have local progress, set it immediately 
                // so the UI doesn't have to wait for the cloud fetch
                if (localProgress) {
                    setProgress(localProgress);
                    setLoading(false); // UI can render now!
                }

                // 2. Get Cloud Data if logged in
                if (session?.user) {
                    try {
                        const { data } = await supabase
                            .from('profiles')
                            .select('progress')
                            .eq('id', session.user.id)
                            .single();

                        if (data?.progress) {
                            cloudProgress = data.progress;
                        }
                    } catch (e) {
                        console.warn("Could not load progress from Supabase", e);
                    }
                }

                // 3. Conflict Resolution: Last Write Wins
                let resolvedProgress = defaultProgress;

                // 3. Conflict Resolution: Last Write Wins
                if (cloudProgress && localProgress) {
                    const cloudTime = cloudProgress.lastUpdated || 0;
                    const localTime = localProgress.lastUpdated || 0;

                    if (localTime > cloudTime) {
                        resolvedProgress = localProgress;
                    } else {
                        resolvedProgress = cloudProgress;
                    }
                } else if (cloudProgress) {
                    resolvedProgress = cloudProgress;
                } else if (localProgress) {
                    resolvedProgress = localProgress;
                }

                // Ensure resolvedProgress has all default fields (backward compatibility)
                resolvedProgress = { ...defaultProgress, ...resolvedProgress };

                // 4. Data Repair: Ensure startDate exists if there is activity
                if (resolvedProgress.activityDates && resolvedProgress.activityDates.length > 0 && !resolvedProgress.startDate) {
                    const sortedDates = [...resolvedProgress.activityDates].sort();
                    resolvedProgress = {
                        ...resolvedProgress,
                        startDate: sortedDates[0],
                        lastUpdated: Date.now() // Mark as updated to trigger sync
                    };
                }

                setProgress(resolvedProgress);

            } catch (e) {
                console.warn("Auth check failed, using local storage", e);
                const local = getLocalProgress();
                setProgress(local || defaultProgress);
            } finally {
                setLoading(false);
            }
        };

        init();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const newUser = session?.user ?? null;
            setUser(newUser);

            if (newUser) {
                // Cache user for next reload
                localStorage.setItem('dsa_last_user', JSON.stringify({
                    email: newUser.email,
                    id: newUser.id
                }));
                setCachedUser({ email: newUser.email, id: newUser.id });

                const local = getLocalProgress(newUser.id);
                if (local) setProgress(local);
            } else {
                localStorage.removeItem('dsa_last_user');
                setCachedUser(null);
                const guest = getLocalProgress();
                setProgress(guest || defaultProgress);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 2. Save logic: If User -> Save Cloud. Always Save Local.
    useEffect(() => {
        if (!isClient || loading) return;

        // Save to user-specific localStorage (Immediate)
        const storageKey = getStorageKey(user?.id);
        localStorage.setItem(storageKey, JSON.stringify(progress));

        // If logged in, save to cloud via ASYNC QUEUE
        if (user) {
            const taskId = `progress_sync_${user.id}`;
            progressSyncQueue.enqueue(taskId, async () => {
                const { error } = await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        progress: progress,
                        updated_at: new Date().toISOString()
                    });
                if (error) throw error; // Reject to trigger queue retry
            });
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
                activityDates: exists ? prev.activityDates : recordActivity(prev),
                lastUpdated: Date.now()
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
                    : [...prev.aptitudeDone, { day, count: 1 }],
                lastUpdated: Date.now()
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
                    : [...prev.reasoningDone, { day, count: 1 }],
                lastUpdated: Date.now()
            };
        });
    };
    
    const toggleAptitudeTopic = (topicId: string) => {
        setProgress(prev => {
            const topics = prev.completedAptitudeTopics || [];
            const exists = topics.includes(topicId);
            return {
                ...prev,
                completedAptitudeTopics: exists
                    ? topics.filter(t => t !== topicId)
                    : [...topics, topicId],
                activityDates: exists ? prev.activityDates : recordActivity(prev),
                lastUpdated: Date.now()
            };
        });
    };

    const toggleReasoningTopic = (topicId: string) => {
        setProgress(prev => {
            const topics = prev.completedReasoningTopics || [];
            const exists = topics.includes(topicId);
            return {
                ...prev,
                completedReasoningTopics: exists
                    ? topics.filter(t => t !== topicId)
                    : [...topics, topicId],
                activityDates: exists ? prev.activityDates : recordActivity(prev),
                lastUpdated: Date.now()
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
                activityDates: exists ? prev.activityDates : recordActivity(prev),
                lastUpdated: Date.now()
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
                }],
                lastUpdated: Date.now()
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
                activityDates: recordActivity(prev),
                lastUpdated: Date.now()
            };
        });
    };

    const getRevisionsDueToday = () => {
        const today = getTodayString();
        const items = progress.revisionItems || [];
        return items.filter(item => item.nextRevisionDate <= today);
    };

    // Set the start date when user begins their journey
    const setStartDate = (date?: string) => {
        setProgress(prev => {
            // Only set if not already set
            if (prev.startDate) return prev;

            // If there are existing activity dates, use the earliest one
            let startDateValue = date || getTodayString();
            if (prev.activityDates && prev.activityDates.length > 0) {
                const sortedDates = [...prev.activityDates].sort();
                const earliestActivity = sortedDates[0];
                if (earliestActivity < startDateValue) {
                    startDateValue = earliestActivity;
                }
            }

            return {
                ...prev,
                startDate: startDateValue,
                activityDates: recordActivity(prev),
                lastUpdated: Date.now()
            };
        });
    };

    // Reset start date (for recalibration - uses earliest activity or today)
    const resetStartDate = () => {
        setProgress(prev => {
            let newStartDate = getTodayString();

            // Use earliest activity date if available
            if (prev.activityDates && prev.activityDates.length > 0) {
                const sortedDates = [...prev.activityDates].sort();
                newStartDate = sortedDates[0];
            }

            return {
                ...prev,
                startDate: newStartDate,
                lastUpdated: Date.now()
            };
        });
    };

    // Topic Focus Mode: Mark a topic as weak
    const markTopicAsWeak = (topicId: string) => {
        setProgress(prev => {
            const currentWeakTopics = prev.weakTopics || [];
            if (currentWeakTopics.includes(topicId)) return prev;

            return {
                ...prev,
                weakTopics: [...currentWeakTopics, topicId],
                topicProgress: {
                    ...prev.topicProgress,
                    [topicId]: {
                        currentLevel: 1,
                        completedProblems: [],
                        flashcardsReviewed: 0,
                        lastPracticed: getTodayString()
                    }
                },
                activityDates: recordActivity(prev),
                lastUpdated: Date.now()
            };
        });
    };

    // Topic Focus Mode: Remove topic from weak list
    const removeWeakTopic = (topicId: string) => {
        setProgress(prev => {
            const newWeakTopics = (prev.weakTopics || []).filter(t => t !== topicId);
            const newTopicProgress = { ...prev.topicProgress };
            delete newTopicProgress[topicId];

            return {
                ...prev,
                weakTopics: newWeakTopics,
                topicProgress: newTopicProgress,
                lastUpdated: Date.now()
            };
        });
    };

    // Topic Focus Mode: Complete an extra problem for a topic
    const completeTopicProblem = (topicId: string, problemTitle: string) => {
        setProgress(prev => {
            const currentProgress = prev.topicProgress[topicId] || {
                currentLevel: 1,
                completedProblems: [],
                flashcardsReviewed: 0,
                lastPracticed: getTodayString()
            };

            if (currentProgress.completedProblems.includes(problemTitle)) return prev;

            const newCompletedProblems = [...currentProgress.completedProblems, problemTitle];

            // Auto-level up: 3 problems = next level
            const newLevel = Math.min(4, Math.floor(newCompletedProblems.length / 3) + 1);

            return {
                ...prev,
                topicProgress: {
                    ...prev.topicProgress,
                    [topicId]: {
                        ...currentProgress,
                        completedProblems: newCompletedProblems,
                        currentLevel: newLevel,
                        lastPracticed: getTodayString()
                    }
                },
                activityDates: recordActivity(prev),
                lastUpdated: Date.now()
            };
        });
    };

    // Topic Focus Mode: Increment flashcards reviewed count
    const reviewFlashcard = (topicId: string) => {
        setProgress(prev => {
            const currentProgress = prev.topicProgress[topicId];
            if (!currentProgress) return prev;

            return {
                ...prev,
                topicProgress: {
                    ...prev.topicProgress,
                    [topicId]: {
                        ...currentProgress,
                        flashcardsReviewed: currentProgress.flashcardsReviewed + 1,
                        lastPracticed: getTodayString()
                    }
                },
                activityDates: recordActivity(prev),
                lastUpdated: Date.now()
            };
        });
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
        setStartDate,
        resetStartDate,
        toggleAptitudeTopic,
        toggleReasoningTopic,
        // Topic Focus Mode
        markTopicAsWeak,
        removeWeakTopic,
        completeTopicProblem,
        reviewFlashcard,
        isProblemCompleted: (id: string) => progress.completedProblems.includes(id),
        isAptitudeCompleted: (day: number) => progress.aptitudeDone.some(a => a.day === day),
        isReasoningCompleted: (day: number) => progress.reasoningDone.some(r => r.day === day),
        isQuestionCompleted: (id: string) => (progress.completedQuestions || []).includes(id),
        isAptitudeTopicCompleted: (id: string) => (progress.completedAptitudeTopics || []).includes(id),
        isReasoningTopicCompleted: (id: string) => (progress.completedReasoningTopics || []).includes(id),
        isTopicWeak: (topicId: string) => (progress.weakTopics || []).includes(topicId),
        startDate: progress.startDate,
        isClient,
        user,
        cachedUser,
        loading
    };
}
