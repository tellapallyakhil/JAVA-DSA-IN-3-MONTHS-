"use client";

import { useProgress } from '@/hooks/useProgress';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { getAllDays } from '@/lib/api';
import { useMemo } from 'react';

interface StartButtonProps {
    className?: string;
    children?: React.ReactNode;
}

export default function StartButton({ className, children }: StartButtonProps) {
    const { progress, setStartDate } = useProgress();
    const days = getAllDays();

    // Calculate the first incomplete day
    const currentDay = useMemo(() => {
        if (!progress) return 1;

        const firstIncomplete = days.find(day => {
            const isAptitudeDone = progress.aptitudeDone.some(d => d.day === day.day);
            const isReasoningDone = progress.reasoningDone.some(d => d.day === day.day);

            // Check if all problems for this day are completed
            const problemCount = day.javaDSA.problems.length;
            const completedProblemsForDay = day.javaDSA.problems.filter(p =>
                progress.completedProblems.includes(p)
            ).length;
            const isDSADone = problemCount === 0 || completedProblemsForDay === problemCount;

            // If DSA problems are NOT done, this is our current day. 
            // We prioritize DSA progress for the main button.
            return !isDSADone;
        });

        return firstIncomplete ? firstIncomplete.day : days.length + 1;
    }, [progress, days]);

    const handleClick = () => {
        setStartDate();
    };

    const isAllComplete = currentDay > days.length;

    return (
        <Link
            href={isAllComplete ? "/day/90" : `/day/${currentDay}`}
            onClick={handleClick}
            className={className || "w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_0_60px_-15px_rgba(124,58,237,0.6)]"}
        >
            {children || (
                <>
                    {isAllComplete ? "Review Course" : `Start Day ${currentDay}`} <ArrowRight size={20} />
                </>
            )}
        </Link>
    );
}
