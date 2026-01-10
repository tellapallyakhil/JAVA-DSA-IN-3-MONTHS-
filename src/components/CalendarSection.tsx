"use client";

import { useProgress } from '@/hooks/useProgress';
import { DailyTask } from '@/types';
import { Calendar } from 'lucide-react';
import CalendarView from './CalendarView';

interface CalendarSectionProps {
    days: DailyTask[];
}

export default function CalendarSection({ days }: CalendarSectionProps) {
    const { progress, isClient } = useProgress();

    if (!isClient) {
        return (
            <section id="calendar">
                <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                    <Calendar className="text-primary" /> 90-Day Calendar
                </h2>
                <div className="glass-card p-6 rounded-2xl w-full animate-pulse">
                    <div className="h-8 bg-white/5 rounded mb-4 w-48"></div>
                    <div className="grid grid-cols-7 gap-2">
                        {[...Array(35)].map((_, i) => (
                            <div key={i} className="aspect-square bg-white/5 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="calendar">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Calendar className="text-primary" /> 90-Day Calendar
            </h2>
            <CalendarView days={days} startDateStr={progress.startDate} />
        </section>
    );
}
