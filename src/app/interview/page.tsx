import InterviewSimulator from '@/components/InterviewSimulator';

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

export default function InterviewPage() {
    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto">
                <InterviewSimulator fullPage />
            </div>
        </div>
    );
}
