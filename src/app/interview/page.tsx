import InterviewSimulator from '@/components/InterviewSimulator';

export const metadata = {
    title: 'AI Interview Simulator | DSA Prep',
    description: 'Practice mock interviews with AI-powered questions and real-time feedback'
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
