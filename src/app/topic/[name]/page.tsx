import { getProblemsByTopic, getAllTopics } from '@/lib/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink, ArrowLeft } from 'lucide-react';
import ProblemCard from '@/components/ProblemCard';

export async function generateStaticParams() {
    const topics = getAllTopics();
    return topics.map(t => ({ name: t }));
}

export default async function TopicPage({ params }: { params: Promise<{ name: string }> }) {
    const { name } = await params;
    const topicName = decodeURIComponent(name);
    const problems = getProblemsByTopic(topicName);

    if (!problems.length) {
        notFound();
    }

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-4">
                <Link href="/topics" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
                    <ArrowLeft size={16} /> Back to Topics
                </Link>
            </div>

            <div>
                <h1 className="text-4xl font-bold mb-2">{topicName}</h1>
                <p className="text-muted-foreground">Problems related to {topicName}.</p>
            </div>

            <div className="grid gap-4">
                {problems.map(p => (
                    <ProblemCard key={p.id} problem={p} showCheckbox={false} />
                ))}
            </div>
        </div>
    )
}
