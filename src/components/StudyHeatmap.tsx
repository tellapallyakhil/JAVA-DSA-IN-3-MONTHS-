'use client';

import { useState, useEffect } from 'react';
import { Calendar, Flame, Target, TrendingUp } from 'lucide-react';
import { useProgress, calculateStreak } from '@/hooks/useProgress';

interface DayActivity {
    date: string;
    // We map activityExists -> problemsSolved > 0 for coloring
    problemsSolved: number;
    minutesStudied: number;
    hasActivity: boolean;
}

const INTENSITY_COLORS = [
    'bg-zinc-800',
    'bg-green-900/60',
    'bg-green-700/70',
    'bg-green-500/80',
    'bg-green-400',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function StudyHeatmap() {
    const { progress, loading } = useProgress();
    const [activityData, setActivityData] = useState<DayActivity[]>([]);
    const [hoveredDay, setHoveredDay] = useState<DayActivity | null>(null);
    const [stats, setStats] = useState({
        currentStreak: 0,
        longestStreak: 0,
        totalProblems: 0,
        totalMinutes: 0,
        activeDays: 0,
    });

    useEffect(() => {
        if (loading) return;

        // Generate date grid for last 365 days
        const data: DayActivity[] = [];
        const today = new Date();
        const activitySet = new Set(progress.activityDates || []);

        for (let i = 364; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const hasActivity = activitySet.has(dateStr);

            data.push({
                date: dateStr,
                // If active, give it a base intensity (1-3) to show green dots
                // Since we don't have exact counts per day in history, we visualize presence of activity
                problemsSolved: hasActivity ? 3 : 0,
                minutesStudied: hasActivity ? 60 : 0, // Placeholder average
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
            // We don't track minutes yet, so we can hide this or show estimate
            totalMinutes: (progress.activityDates?.length || 0) * 60,
            activeDays: progress.activityDates?.length || 0,
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
    const weeks: DayActivity[][] = [];
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
            weeks.push(currentWeek);
            currentWeek = [];
        }
    });

    if (currentWeek.length > 0) {
        weeks.push(currentWeek);
    }

    // Get month labels
    const monthLabels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
        const firstValidDay = week.find(d => d.date);
        if (firstValidDay) {
            const month = new Date(firstValidDay.date).getMonth();
            if (month !== lastMonth) {
                monthLabels.push({ label: MONTHS[month], weekIndex });
                lastMonth = month;
            }
        }
    });

    if (loading) {
        return <div className="glass-card p-6 h-[300px] flex items-center justify-center text-muted-foreground">Loading activity...</div>;
    }

    return (
        <div className="glass-card p-6 min-h-[300px]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-lg">
                        <Calendar className="text-green-400" size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Study Activity</h2>
                        <p className="text-sm text-muted-foreground">{stats.activeDays} days of learning</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-500/20 rounded-xl p-4">
                    <Flame className="text-orange-400 mb-2" size={20} />
                    <div className="text-2xl font-bold">{stats.currentStreak}</div>
                    <div className="text-xs text-muted-foreground">Current Streak</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/5 border border-purple-500/20 rounded-xl p-4">
                    <Target className="text-purple-400 mb-2" size={20} />
                    <div className="text-2xl font-bold">{stats.longestStreak}</div>
                    <div className="text-xs text-muted-foreground">Longest Streak</div>
                </div>
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl p-4">
                    <TrendingUp className="text-green-400 mb-2" size={20} />
                    <div className="text-2xl font-bold">{stats.totalProblems}</div>
                    <div className="text-xs text-muted-foreground">Problems Solved</div>
                </div>
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 rounded-xl p-4">
                    <Calendar className="text-blue-400 mb-2" size={20} />
                    <div className="text-2xl font-bold">{Math.floor(stats.totalMinutes / 60)}h</div>
                    <div className="text-xs text-muted-foreground">Est. Study Time</div>
                </div>
            </div>

            {/* Heatmap */}
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
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

                    <div className="flex gap-0.5">
                        {/* Day Labels */}
                        <div className="flex flex-col gap-0.5 mr-2">
                            {DAYS.map((day, i) => (
                                <div key={i} className="h-3 text-[10px] text-muted-foreground leading-3">
                                    {i % 2 === 1 ? day : ''}
                                </div>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="flex gap-0.5">
                            {weeks.map((week, weekIndex) => (
                                <div key={weekIndex} className="flex flex-col gap-0.5">
                                    {week.map((day, dayIndex) => (
                                        <div
                                            key={dayIndex}
                                            className={`w-3 h-3 rounded-sm transition-all cursor-pointer hover:ring-2 hover:ring-white/30 ${day.problemsSolved === -1
                                                ? 'bg-transparent'
                                                : INTENSITY_COLORS[getIntensityLevel(day.problemsSolved)]
                                                }`}
                                            onMouseEnter={() => day.problemsSolved >= 0 && setHoveredDay(day)}
                                            onMouseLeave={() => setHoveredDay(null)}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hover Tooltip */}
                    {hoveredDay && (
                        <div className="mt-4 p-3 bg-zinc-800 rounded-lg inline-block">
                            <div className="font-medium">{hoveredDay.date}</div>
                            <div className="text-sm text-muted-foreground">
                                {hoveredDay.hasActivity ? 'Active Day' : 'No Activity'} • {hoveredDay.hasActivity ? '~1 hour' : '0 min'}
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="flex items-center justify-end gap-2 mt-4">
                        <span className="text-xs text-muted-foreground">Less</span>
                        {INTENSITY_COLORS.map((color, i) => (
                            <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
                        ))}
                        <span className="text-xs text-muted-foreground">More</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
