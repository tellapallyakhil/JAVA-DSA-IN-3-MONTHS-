"use client";

import { useState, useEffect } from 'react';
import { useProgress, calculateStreak } from '@/hooks/useProgress';
import { getAllDays, getAllProblems } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import {
    User, Mail, Calendar, Award, Target, TrendingUp,
    Settings, LogOut, Shield, Clock, Zap, BookOpen,
    Code, Brain, ChevronRight, Edit3, Save, X, Flame
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
    const { progress, user, isClient, loading } = useProgress();
    const router = useRouter();

    const [allDays, setAllDays] = useState<any[]>([]);
    const [allProblems, setAllProblems] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [saving, setSaving] = useState(false);

    // Password change state
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [passLoading, setPassLoading] = useState(false);
    const [passMessage, setPassMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    async function handlePasswordChange() {
        if (newPassword.length < 6) {
            setPassMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
            return;
        }

        setPassLoading(true);
        setPassMessage(null);

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) {
            setPassMessage({ text: error.message, type: 'error' });
        } else {
            setPassMessage({ text: 'Password updated successfully!', type: 'success' });
            setNewPassword('');
            setTimeout(() => {
                setIsChangingPassword(false);
                setPassMessage(null);
            }, 2000);
        }
        setPassLoading(false);
    }

    useEffect(() => {
        const load = async () => {
            try {
                const [days, problems] = await Promise.all([getAllDays(), getAllProblems()]);
                setAllDays(days);
                setAllProblems(problems);
            } catch (err) {
                console.error("Failed to load profile data:", err);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [loading, user, router]);

    if (!isClient || loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading profile...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    // Calculate stats
    const totalProblems = allProblems.length;
    const solvedProblems = progress.completedProblems.length;
    const dsaPercentage = totalProblems ? Math.round((solvedProblems / totalProblems) * 100) : 0;

    const totalDays = allDays.length;
    const aptitudeDone = progress.aptitudeDone.length;
    const reasoningDone = progress.reasoningDone.length;
    const questionsAnswered = progress.completedQuestions?.length || 0;

    // Calculate percentages safely (avoid division by zero)
    const aptitudePercentage = totalDays ? Math.round((aptitudeDone / totalDays) * 100) : 0;
    const reasoningPercentage = totalDays ? Math.round((reasoningDone / totalDays) * 100) : 0;

    // Calculate actual streaks from activity data
    const streakData = calculateStreak(progress.activityDates || []);
    const currentStreak = streakData.current;
    const longestStreak = streakData.longest;

    const memberSince = user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Unknown';

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        // In a real app, you would save displayName to Supabase
        await new Promise(resolve => setTimeout(resolve, 500));
        setSaving(false);
        setIsEditing(false);
    };

    const achievements = [
        {
            id: 1,
            title: "First Steps",
            description: "Complete your first problem",
            unlocked: solvedProblems >= 1,
            icon: Target,
            progress: `${Math.min(solvedProblems, 1)}/1`
        },
        {
            id: 2,
            title: "Getting Started",
            description: "Complete 5 problems",
            unlocked: solvedProblems >= 5,
            icon: Code,
            progress: `${Math.min(solvedProblems, 5)}/5`
        },
        {
            id: 3,
            title: "Problem Solver",
            description: "Complete 10 problems",
            unlocked: solvedProblems >= 10,
            icon: Code,
            progress: `${Math.min(solvedProblems, 10)}/10`
        },
        {
            id: 4,
            title: "On Fire",
            description: "Maintain a 3-day streak",
            unlocked: longestStreak >= 3,
            icon: Flame,
            progress: `${Math.min(longestStreak, 3)}/3`
        },
        {
            id: 5,
            title: "Week Warrior",
            description: "Maintain a 7-day streak",
            unlocked: longestStreak >= 7,
            icon: Zap,
            progress: `${Math.min(longestStreak, 7)}/7`
        },
        {
            id: 6,
            title: "DSA Master",
            description: "Complete 50 problems",
            unlocked: solvedProblems >= 50,
            icon: Award,
            progress: `${Math.min(solvedProblems, 50)}/50`
        },
        {
            id: 7,
            title: "Consistent Learner",
            description: "Complete aptitude 7 days",
            unlocked: aptitudeDone >= 7,
            icon: Brain,
            progress: `${Math.min(aptitudeDone, 7)}/7`
        },
        {
            id: 8,
            title: "Quiz Champion",
            description: "Answer 10 quiz questions",
            unlocked: questionsAnswered >= 10,
            icon: BookOpen,
            progress: `${Math.min(questionsAnswered, 10)}/10`
        },
    ];

    const unlockedCount = achievements.filter(a => a.unlocked).length;

    return (
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
            {/* Profile Header */}
            <div className="glass-card p-4 sm:p-6 md:p-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10" />

                <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                    {/* Avatar */}
                    <div className="relative mx-auto md:mx-0">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white uppercase shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)]">
                            {user.email?.slice(0, 2)}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-4 border-zinc-900 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    value={displayName || user.email?.split('@')[0] || ''}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="text-2xl font-bold bg-white/5 border border-white/20 rounded-lg px-3 py-1 focus:outline-none focus:border-primary"
                                    placeholder="Display Name"
                                />
                                <button onClick={handleSaveProfile} disabled={saving} className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors">
                                    <Save size={18} />
                                </button>
                                <button onClick={() => setIsEditing(false)} className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 mb-2">
                                <h1 className="text-2xl font-bold">{displayName || user.email?.split('@')[0] || 'User'}</h1>
                                <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-white">
                                    <Edit3 size={16} />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-2 text-muted-foreground mb-4">
                            <Mail size={14} />
                            <span className="text-sm">{user.email}</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-1.5 text-xs bg-white/5 px-3 py-1.5 rounded-full">
                                <Calendar size={12} />
                                Member since {memberSince}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs bg-primary/20 text-primary px-3 py-1.5 rounded-full">
                                <Shield size={12} />
                                Cloud Sync Enabled
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col gap-2">
                        <Link href="/progress" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm">
                            <TrendingUp size={16} />
                            View Progress
                            <ChevronRight size={14} className="ml-auto" />
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm"
                        >
                            <LogOut size={16} />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass p-5 rounded-xl text-center">
                    <Code className="mx-auto mb-2 text-blue-400" size={24} />
                    <div className="text-3xl font-black">{solvedProblems}</div>
                    <div className="text-xs text-muted-foreground">Problems Solved</div>
                </div>
                <div className="glass p-5 rounded-xl text-center">
                    <Brain className="mx-auto mb-2 text-purple-400" size={24} />
                    <div className="text-3xl font-black">{aptitudeDone}</div>
                    <div className="text-xs text-muted-foreground">Aptitude Days</div>
                </div>
                <div className="glass p-5 rounded-xl text-center">
                    <Zap className="mx-auto mb-2 text-yellow-400" size={24} />
                    <div className="text-3xl font-black">{currentStreak}</div>
                    <div className="text-xs text-muted-foreground">Current Streak</div>
                </div>
                <div className="glass p-5 rounded-xl text-center">
                    <Award className="mx-auto mb-2 text-amber-400" size={24} />
                    <div className="text-3xl font-black">{unlockedCount}/{achievements.length}</div>
                    <div className="text-xs text-muted-foreground">Achievements</div>
                </div>
            </div>

            {/* Achievements Section */}
            <section className="glass-card p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                    <Award className="text-amber-400" />
                    Achievements
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {achievements.map(achievement => (
                        <div
                            key={achievement.id}
                            className={`p-3 sm:p-4 rounded-xl border transition-all ${achievement.unlocked
                                ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30'
                                : 'bg-white/[0.02] border-white/5'
                                }`}
                        >
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-2 sm:mb-3 ${achievement.unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-zinc-600'
                                }`}>
                                <achievement.icon size={18} className="sm:w-5 sm:h-5" />
                            </div>
                            <h3 className={`font-bold text-xs sm:text-sm mb-1 ${achievement.unlocked ? '' : 'text-zinc-500'}`}>{achievement.title}</h3>
                            <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 line-clamp-2">{achievement.description}</p>
                            {achievement.unlocked ? (
                                <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Unlocked ✓</div>
                            ) : (
                                <div className="text-[10px] text-zinc-500 font-mono">{achievement.progress}</div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* Activity Overview */}
            <section className="glass-card p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Clock className="text-blue-400" />
                    Learning Overview
                </h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span>DSA Progress</span>
                            <span className="text-blue-400">{dsaPercentage}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-1000 ease-out rounded-full" style={{ width: `${dsaPercentage}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span>Aptitude Days</span>
                            <span className="text-purple-400">{aptitudePercentage}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-400 h-full transition-all duration-1000 ease-out rounded-full" style={{ width: `${aptitudePercentage}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span>Reasoning Days</span>
                            <span className="text-pink-400">{reasoningPercentage}%</span>
                        </div>
                        <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden">
                            <div className="bg-gradient-to-r from-pink-500 to-red-400 h-full transition-all duration-1000 ease-out rounded-full" style={{ width: `${reasoningPercentage}%` }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Account Settings */}
            <section className="glass-card p-6">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Settings className="text-zinc-400" />
                    Account Settings
                </h2>
                <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left">
                        <div className="flex items-center gap-3">
                            <Mail size={18} className="text-muted-foreground" />
                            <div>
                                <div className="font-medium">Email Address</div>
                                <div className="text-sm text-muted-foreground">{user.email}</div>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left" onClick={() => setIsChangingPassword(true)}>
                        <div className="flex items-center gap-3">
                            <Shield size={18} className="text-muted-foreground" />
                            <div>
                                <div className="font-medium">Change Password</div>
                                <div className="text-sm text-muted-foreground">Update your password</div>
                            </div>
                        </div>
                        <ChevronRight size={18} className="text-muted-foreground" />
                    </button>

                    {/* Change Password Modal/Overlay */}
                    {isChangingPassword && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                            <div className="glass-card p-6 w-full max-w-sm space-y-4 animate-in zoom-in duration-300">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-bold">Update Password</h3>
                                    <button onClick={() => { setIsChangingPassword(false); setPassMessage(null); }} className="p-1 hover:bg-white/10 rounded-lg">
                                        <X size={18} />
                                    </button>
                                </div>
                                <p className="text-sm text-muted-foreground">Enter your new password below (min 6 characters).</p>
                                
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="New Password"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary transition-all"
                                        />
                                    </div>

                                    {passMessage && (
                                        <div className={`text-xs p-3 rounded-lg flex items-center gap-2 ${passMessage.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                            <Shield size={14} />
                                            {passMessage.text}
                                        </div>
                                    )}

                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={passLoading}
                                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {passLoading ? <Zap className="animate-spin" size={18} /> : 'Update Password'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors text-left text-red-400"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={18} />
                            <div>
                                <div className="font-medium">Sign Out</div>
                                <div className="text-sm text-red-400/70">Log out of your account</div>
                            </div>
                        </div>
                    </button>
                </div>
            </section>
        </div>
    );
}
