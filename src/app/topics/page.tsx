import Link from 'next/link';
import { getAllTopics } from '@/lib/api';
import { BookOpen, Code, ArrowRight } from 'lucide-react';
import concepts from '@/data/concepts.json';

export default async function TopicsPage() {
    const topics = await getAllTopics();
    const concepts = await import('@/data/concepts.json').then(mod => mod.default);
    const conceptKeys = Object.keys(concepts);

    return (
        <div className="space-y-12 animate-in fade-in duration-500">
            <header>
                <h1 className="text-4xl font-bold flex items-center gap-3">
                    <BookOpen className="text-primary" /> DSA Topics
                </h1>
                <p className="text-muted-foreground mt-2">Master data structures and algorithms by topic. Click any topic to view related problems and notes.</p>
            </header>

            {/* Topics with Notes Available */}
            <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Code className="text-green-400" /> Topics with Study Notes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {conceptKeys.map(topic => {
                        // @ts-ignore
                        const noteData = concepts[topic];
                        const hasFlashcards = noteData.content.includes('**Q:');

                        return (
                            <Link
                                key={topic}
                                href={`/notes/${encodeURIComponent(topic)}`}
                                className="glass-card p-6 hover:border-green-500/30 transition-all group"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold group-hover:text-green-400 transition-colors">{topic}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{noteData.title}</p>
                                    </div>
                                    <ArrowRight className="text-muted-foreground group-hover:text-green-400 group-hover:translate-x-1 transition-all" size={20} />
                                </div>
                                <div className="mt-4 flex items-center gap-2">
                                    <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20">Notes Available</span>
                                    {hasFlashcards && (
                                        <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full border border-blue-500/20">Flashcards</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* All Topics Grid */}
            <section>
                <h2 className="text-2xl font-bold mb-6">All Problem Topics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {topics.map(topic => (
                        <Link
                            key={topic}
                            href={`/topic/${encodeURIComponent(topic)}`}
                            className="glass p-6 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-white/5 transition-all group"
                        >
                            <span className="font-semibold text-lg group-hover:text-primary transition-colors text-center">{topic}</span>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    )
}
