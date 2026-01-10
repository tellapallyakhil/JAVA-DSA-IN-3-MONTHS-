"use client";

import { useProgress } from '@/hooks/useProgress';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface StartButtonProps {
    className?: string;
    children?: React.ReactNode;
}

export default function StartButton({ className, children }: StartButtonProps) {
    const { setStartDate } = useProgress();

    const handleClick = () => {
        // Set the start date when user begins their journey
        setStartDate();
    };

    return (
        <Link
            href="/day/1"
            onClick={handleClick}
            className={className || "w-full sm:w-auto bg-primary hover:bg-primary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)] hover:shadow-[0_0_60px_-15px_rgba(124,58,237,0.6)]"}
        >
            {children || (
                <>
                    Start Day 1 <ArrowRight size={20} />
                </>
            )}
        </Link>
    );
}
