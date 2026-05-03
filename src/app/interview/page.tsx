import InterviewSimulator from '@/components/features/InterviewSimulator';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Interview Simulator | Practice Technical & Behavioral Interviews',
    description: 'Master your technical communication with our AI-powered interview simulator. Practice DSA questions and behavioral rounds with real-time AI feedback.',
    keywords: [
        "AI interview simulator", "mock interview practice", "online technical interview prep",
        "behavioral interview AI", "coding interview feedback", "practice mock interviews",
        "AI interview coach", "technical communication practice", "FAANG mock interview"
    ],
};

export default async function InterviewPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams;
    const company = typeof params.company === 'string' ? params.company : '';

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto">
                <InterviewSimulator fullPage initialCompany={company} />
            </div>
        </div>
    );
}

