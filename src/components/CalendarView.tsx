"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { DailyTask } from '@/types';
import { ChevronLeft, ChevronRight, Calendar, Check, Briefcase, PartyPopper } from 'lucide-react';
import { motion } from 'framer-motion';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarViewProps {
    days: DailyTask[];
    completedDays?: number[];
}

export default function CalendarView({ days, completedDays = [] }: CalendarViewProps) {
    const [isClient, setIsClient] = useState(false);
    const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

    // Fixed start date to avoid hydration mismatch
    const startDate = useMemo(() => {
        // Use a fixed date for SSR, will be same on client
        const date = new Date(2026, 0, 9); // January 9, 2026
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Get the current month to display
    const displayDate = useMemo(() => {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + currentMonthOffset);
        return date;
    }, [startDate, currentMonthOffset]);

    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();

    // Get first day of month and total days
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Map day numbers to DailyTask
    const dayToTaskMap = useMemo(() => {
        const map = new Map<string, DailyTask>();
        days.forEach((task, index) => {
            const taskDate = new Date(startDate);
            taskDate.setDate(taskDate.getDate() + index);
            const key = `${taskDate.getFullYear()}-${taskDate.getMonth()}-${taskDate.getDate()}`;
            map.set(key, task);
        });
        return map;
    }, [days, startDate]);

    // Generate calendar grid
    const calendarCells = [];
    let dayCounter = 1;

    for (let i = 0; i < 6; i++) { // 6 weeks max
        const week = [];
        for (let j = 0; j < 7; j++) {
            if ((i === 0 && j < firstDayOfMonth) || dayCounter > daysInMonth) {
                week.push(null);
            } else {
                const cellDate = new Date(year, month, dayCounter);
                const key = `${cellDate.getFullYear()}-${cellDate.getMonth()}-${cellDate.getDate()}`;
                const task = dayToTaskMap.get(key);
                week.push({ date: dayCounter, task, cellDate });
                dayCounter++;
            }
        }
        calendarCells.push(week);
        if (dayCounter > daysInMonth) break;
    }

    const goToPrevMonth = () => setCurrentMonthOffset(prev => Math.max(prev - 1, 0));
    const goToNextMonth = () => setCurrentMonthOffset(prev => Math.min(prev + 1, 2)); // 3 months max

    return (
        <div className="glass-card p-6 rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={goToPrevMonth}
                    disabled={currentMonthOffset === 0}
                    className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft />
                </button>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Calendar className="text-primary" />
                    {MONTHS[month]} {year}
                </h2>
                <button
                    onClick={goToNextMonth}
                    disabled={currentMonthOffset === 2}
                    className="p-2 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight />
                </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {WEEKDAYS.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarCells.flat().map((cell, index) => {
                    if (!cell) {
                        return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const { date, task, cellDate } = cell;
                    const isCompleted = task && completedDays.includes(task.day);
                    const isToday = new Date().toDateString() === cellDate.toDateString();
                    const isPast = cellDate < new Date(new Date().setHours(0, 0, 0, 0));
                    const isHoliday = task?.type === 'Holiday';

                    return (
                        <motion.div
                            key={`day-${date}`}
                            whileHover={{ scale: task ? 1.05 : 1 }}
                            className="aspect-square"
                        >
                            {task ? (
                                <Link
                                    href={`/day/${task.day}`}
                                    className={`
                                        w-full h-full rounded-xl flex flex-col items-center justify-center relative
                                        transition-all duration-200 border
                                        ${isCompleted
                                            ? 'bg-green-500/20 border-green-500/40 text-green-400'
                                            : isToday
                                                ? 'bg-primary/20 border-primary ring-2 ring-primary/50 text-white'
                                                : isHoliday
                                                    ? 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20 text-purple-300'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white'
                                        }
                                    `}
                                >
                                    <span className="text-lg font-bold">{date}</span>
                                    <span className="text-[9px] uppercase tracking-wider opacity-70">Day {task.day}</span>

                                    {isCompleted && (
                                        <div className="absolute top-1 right-1">
                                            <Check size={12} className="text-green-500" />
                                        </div>
                                    )}
                                    {isHoliday && !isCompleted && (
                                        <div className="absolute top-1 left-1">
                                            <PartyPopper size={10} className="text-purple-400" />
                                        </div>
                                    )}
                                    {!isHoliday && !isCompleted && (
                                        <div className="absolute top-1 left-1">
                                            <Briefcase size={10} className="text-blue-400" />
                                        </div>
                                    )}
                                </Link>
                            ) : (
                                <div className={`
                                    w-full h-full rounded-xl flex items-center justify-center
                                    ${isPast ? 'text-zinc-600' : 'text-zinc-500'} text-sm
                                    bg-white/[0.02] border border-transparent
                                `}>
                                    {date}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-primary/50"></div>
                    <span>Today</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Briefcase size={12} className="text-blue-400" />
                    <span>Work Day</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <PartyPopper size={12} className="text-purple-400" />
                    <span>Holiday (More Practice)</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-green-500/50"></div>
                    <span>Completed</span>
                </div>
            </div>
        </div>
    );
}
