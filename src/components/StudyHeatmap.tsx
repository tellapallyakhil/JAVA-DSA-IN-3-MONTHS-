'use client';

import { useState, useEffect, useMemo } from 'react';
import { Calendar, Flame, Target, TrendingUp, Award, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProgress, calculateStreak } from '@/hooks/useProgress';

interface DayActivity {
    date: string;
    problemsSolved: number;
    minutesStudied: number;
    hasActivity: boolean;
}

const INTENSITY_COLORS = [
    'bg-zinc-800/50',
    'bg-green-900/70',
    'bg-green-700/80',
    'bg-green-500/90',
    'bg-green-400',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StudyHeatmap() {
    const { progress, loading } = useProgress();
    const [activityData, setActivityData] = useState<DayActivity[]>([]);
    const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const [viewMode, setViewMode] = useState<'year' | 'month'>('year');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [stats, setStats] = useState({
        currentStreak: 0,
        longestStreak: 0,
        totalProblems: 0,
        totalMinutes: 0,
        activeDays: 0,
        thisWeek: 0,
        thisMonth: 0,
    });

    useEffect(() => {
        if (loading) return;

        // Generate date grid for last 365 days
        const data: DayActivity[] = [];
        const today = new Date();
        const activitySet = new Set(progress.activityDates || []);

        // Count this week and month
        let thisWeek = 0;
        let thisMonth = 0;
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const hasActivity = activitySet.has(dateStr);

            if (hasActivity) {
                if (date >= startOfWeek) thisWeek++;
                if (date >= startOfMonth) thisMonth++;
            }

            data.push({
                date: dateStr,
                problemsSolved: hasActivity ? 3 : 0,
                minutesStudied: hasActivity ? 60 : 0,
                hasActivity
            });
        }

        setActivityData(data);

        // Calculate real stats
        const streakInfo = calculateStreak(progress.activityDates || []);

        setStats({
            currentStreak: streakInfo.current,
            longestStreak: streakInfo.longest,
            totalProblems: progress.completedProblems.length,
            totalMinutes: (progress.activityDates?.length || 0) * 60,
            activeDays: progress.activityDates?.length || 0,
            thisWeek,
            thisMonth,
        });

    }, [progress, loading]);

    // Helper for coloring
    function getIntensityLevel(problems: number): number {
        if (problems === 0) return 0;
        if (problems <= 2) return 1;
        if (problems <= 4) return 2;
        if (problems <= 6) return 3;
        return 4;
    }

    // Group data by weeks for the grid
    const weeks = useMemo(() => {
        const result: DayActivity[][] = [];
        let currentWeek: DayActivity[] = [];

        // Pad the first week
        if (activityData.length > 0) {
            const firstDay = new Date(activityData[0].date).getDay();
            for (let i = 0; i < firstDay; i++) {
                currentWeek.push({ date: '', problemsSolved: -1, minutesStudied: 0, hasActivity: false });
            }
        }

        activityData.forEach((day) => {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                result.push(currentWeek);
                currentWeek = [];
            }
        });

        if (currentWeek.length > 0) {
            result.push(currentWeek);
        }

        return result;
    }, [activityData]);

    // Get month labels
    const monthLabels = useMemo(() => {
        const labels: { label: string; weekIndex: number }[] = [];
        let lastMonth = -1;
        weeks.forEach((week, weekIndex) => {
            const firstValidDay = week.find(d => d.date);
            if (firstValidDay) {
                const month = new Date(firstValidDay.date).getMonth();
                if (month !== lastMonth) {
                    labels.push({ label: MONTHS[month], weekIndex });
                    lastMonth = month;
                }
            }
        });
        return labels;
    }, [weeks]);

    // Handle tooltip positioning
    const handleHover = (day: DayActivity, event: React.MouseEvent) => {
        if (day.problemsSolved >= 0) {
            setHoveredDay(day);
            const rect = event.currentTarget.getBoundingClientRect();
            setTooltipPos({
                x: rect.left + rect.width / 2,
                y: rect.top - 10
            });
        }
    };

    // Get motivational message based on streak
    const getMotivationalMessage = () => {
        if (stats.currentStreak === 0) return "Start your streak today! 🔥";
        if (stats.currentStreak < 3) return "Keep going! Building momentum 💪";
        if (stats.currentStreak < 7) return "Great progress this week! 🌟";
        if (stats.currentStreak < 14) return "Amazing consistency! 🚀";
        if (stats.currentStreak < 30) return "You're on fire! 🔥🔥";
        return "Legendary dedication! 👑";
    };

    if (loading) {
        return (
            <div className="glass-card p-6 h-[360px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-green-500/20 border-t-green-500 animate-spin" />
                    </div>
                    <span className="text-muted-foreground text-sm">Loading activity...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card p-4 sm:p-6 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-green-500/10 to-transparent rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-green-500/20 via-emerald-500/15 to-teal-500/10 rounded-xl shadow-lg shadow-green-500/5 border border-green-500/10">
                            <Calendar className="text-green-400" size={22} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Study Activity</h2>
                            <p className="text-sm text-muted-foreground">{stats.activeDays} days of learning</p>
                        </div>
                    </div>

                    {/* Streak Badge */}
                    {stats.currentStreak > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange-500/20 to-red-500/10 border border-orange-500/30 rounded-full animate-pulse">
                            <Flame className="text-orange-400" size={16} />
                            <span className="text-sm font-bold text-orange-300">{stats.currentStreak} day streak!</span>
                        </div>
                    )}
                </div>

                {/* Stats Cards - Enhanced */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="group bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-orange-500/40 transition-all hover:shadow-lg hover:shadow-orange-500/5">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <Flame className="text-orange-400 group-hover:scale-110 transition-transform" size={18} />
                            {stats.currentStreak > 0 && (
                                <span className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-orange-500/20 rounded-full text-orange-300">Active</span>
                            )}
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-orange-100">{stats.currentStreak}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">Current Streak</div>
                    </div>

                    <div className="group bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-purple-500/40 transition-all hover:shadow-lg hover:shadow-purple-500/5">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <Award className="text-purple-400 group-hover:scale-110 transition-transform" size={18} />
                            {stats.longestStreak >= 7 && (
                                <span className="text-[8px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-purple-500/20 rounded-full text-purple-300">Best</span>
                            )}
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-purple-100">{stats.longestStreak}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">Longest Streak</div>
                    </div>

                    <div className="group bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-green-500/40 transition-all hover:shadow-lg hover:shadow-green-500/5">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <TrendingUp className="text-green-400 group-hover:scale-110 transition-transform" size={18} />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-green-100">{stats.totalProblems}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">Problems Solved</div>
                    </div>

                    <div className="group bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-blue-500/40 transition-all hover:shadow-lg hover:shadow-blue-500/5">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                            <Zap className="text-blue-400 group-hover:scale-110 transition-transform" size={18} />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-100">{stats.thisWeek}</div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground">This Week</div>
                    </div>
                </div>

                {/* Motivational Message */}
                <div className="mb-4 px-4 py-2 bg-gradient-to-r from-white/5 to-transparent rounded-lg border-l-2 border-green-500/50">
                    <p className="text-sm text-white/70">{getMotivationalMessage()}</p>
                </div>

                {/* Heatmap */}
                <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                    {/* Mobile scroll hint */}
                    <div className="sm:hidden flex items-center justify-center gap-2 text-[10px] text-muted-foreground mb-2">
                        <span>← Swipe to see all months →</span>
                    </div>
                    <div className="min-w-[700px]">
                        {/* Month Labels */}
                        <div className="relative h-5 mb-1 ml-8">
                            {monthLabels.map((m, i) => (
                                <div
                                    key={i}
                                    className="absolute text-[10px] text-muted-foreground font-medium"
                                    style={{ left: `${m.weekIndex * 14}px` }}
                                >
                                    {m.label}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-[3px]">
                            {/* Day Labels */}
                            <div className="flex flex-col gap-[3px] mr-1.5 pt-0.5">
                                {DAYS.map((day, i) => (
                                    <div key={i} className="h-[11px] text-[9px] text-muted-foreground leading-[11px] w-6">
                                        {i % 2 === 1 ? day.slice(0, 3) : ''}
                                    </div>
                                ))}
                            </div>

                            {/* Grid */}
                            <div className="flex gap-[3px]">
                                {weeks.map((week, weekIndex) => (
                                    <div key={weekIndex} className="flex flex-col gap-[3px]">
                                        {week.map((day, dayIndex) => {
                                            const isToday = day.date === new Date().toISOString().split('T')[0];
                                            return (
                                                <div
                                                    key={dayIndex}
                                                    className={`w-[11px] h-[11px] rounded-[2px] transition-all cursor-pointer relative
                                                        ${day.problemsSolved === -1
                                                            ? 'bg-transparent'
                                                            : INTENSITY_COLORS[getIntensityLevel(day.problemsSolved)]
                                                        }
                                                        ${isToday ? 'ring-1 ring-white/50 ring-offset-1 ring-offset-zinc-950' : ''}
                                                        hover:scale-125 hover:z-10
                                                    `}
                                                    onMouseEnter={(e) => handleHover(day, e)}
                                                    onMouseLeave={() => setHoveredDay(null)}
                                                >
                                                    {day.hasActivity && (
                                                        <div className="absolute inset-0 rounded-[2px] bg-green-400/20 animate-pulse" style={{ animationDuration: '3s' }} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-xs text-muted-foreground">
                                {stats.thisMonth} contributions this month
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-muted-foreground">Less</span>
                                {INTENSITY_COLORS.map((color, i) => (
                                    <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${color}`} />
                                ))}
                                <span className="text-[10px] text-muted-foreground">More</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Mobile scroll hint at bottom */}
                <div className="sm:hidden flex items-center justify-center gap-2 text-[10px] text-muted-foreground/50 mt-2">
                    <span>Scroll →</span>
                </div>
            </div>

            {/* Floating Tooltip */}
            {hoveredDay && hoveredDay.date && (
                <div
                    className="fixed z-50 px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{ left: tooltipPos.x, top: tooltipPos.y }}
                >
                    <div className="font-medium text-sm text-white">{new Date(hoveredDay.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${hoveredDay.hasActivity ? 'bg-green-400' : 'bg-zinc-600'}`} />
                        {hoveredDay.hasActivity ? 'Active Day' : 'No Activity'}
                    </div>
                </div>
            )}
        </div>
    );
}
