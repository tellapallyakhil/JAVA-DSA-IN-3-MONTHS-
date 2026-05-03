"use client";

import { useProgress } from '@/hooks/useProgress';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getAllDays } from '@/lib/api';
import { useState, useEffect, useMemo } from 'react';

interface StartButtonProps {
    className?: string;
    children?: React.ReactNode;
}

export default function StartButton({ className, children }: StartButtonProps) {
    const { progress, setStartDate } = useProgress();
    const [allDays, setAllDays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const days = await getAllDays();
                setAllDays(days);
            } catch (err) {
                console.error("Failed to load days in StartButton", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Calculate the first incomplete day
    const currentDay = useMemo(() => {
        if (loading || !allDays.length) return 1;
        if (!progress) return 1;

        const firstIncomplete = allDays.find((day: any) => {
            // Check if all problems for this day are completed
            const problemCount = day.javaDSA.problems.length;
            const completedProblemsForDay = day.javaDSA.problems.filter((p: string) =>
                progress.completedProblems.includes(p)
            ).length;
            const isDSADone = problemCount === 0 || completedProblemsForDay === problemCount;

            return !isDSADone;
        });

        return firstIncomplete ? firstIncomplete.day : allDays.length + 1;
    }, [progress, allDays, loading]);

    const handleClick = () => {
        setStartDate();
    };

    const isAllComplete = !loading && allDays.length > 0 && currentDay > allDays.length;

    return (
        <Link
            href={isAllComplete ? "/day/90" : `/day/${currentDay}`}
            onClick={handleClick}
            className={className || "w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_0_60px_-15px_rgba(124,58,237,0.6)]"}
        >
            {children || (
                <span className="inline-flex items-center gap-2">
                    {isAllComplete ? "Review Course" : `Start Day ${currentDay}`}
                    <ArrowRight size={20} />
                </span>
            )}
        </Link>
    );
}

