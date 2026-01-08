"use client";

import { use } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Lightbulb, Code, Brain } from 'lucide-react';
import concepts from '@/data/concepts.json';
import FlashcardDeck from '@/components/FlashcardDeck';
import { Flashcard } from '@/types';

// Generate flashcards from note content
function generateFlashcards(content: string): Flashcard[] {
    const flashcards: Flashcard[] = [];

    // Extract Interview Questions from content
    const qPattern = /\*\*Q: (.+?)\*\*\s*\nA: (.+?)(?=\n\n|\n\*\*Q:|$)/g;
    let match;
    while ((match = qPattern.exec(content)) !== null) {
        flashcards.push({
            front: match[1].trim(),
            back: match[2].trim()
        });
    }

    return flashcards;
}

export default function NotesPage({ params }: { params: Promise<{ topic: string }> }) {
    const resolvedParams = use(params);
    const topic = decodeURIComponent(resolvedParams.topic);

    // @ts-ignore
    const noteData = concepts[topic];

    if (!noteData) {
        return (
            <div className="text-center py-20">
                <h1 className="text-3xl font-bold mb-4">Notes Not Found</h1>
                <p className="text-muted-foreground mb-8">No notes available for "{topic}" yet.</p>
                <Link href="/topics" className="text-primary hover:underline">← Back to Topics</Link>
            </div>
        );
    }

    const flashcards = generateFlashcards(noteData.content);

    return (
        <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl mx-auto">
            {/* Header */}
            <header>
                <Link href="/topics" className="text-muted-foreground hover:text-white flex items-center gap-2 mb-4 text-sm">
                    <ArrowLeft size={16} /> Back to Topics
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="text-primary" size={28} />
                    <h1 className="text-4xl font-bold">{noteData.title}</h1>
                </div>
                <p className="text-muted-foreground">Comprehensive study notes for {topic}</p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="glass p-4 rounded-xl text-center">
                    <Code className="mx-auto mb-2 text-blue-400" size={24} />
                    <div className="text-sm text-muted-foreground">Code Examples</div>
                    <div className="font-bold">Included</div>
                </div>
                <div className="glass p-4 rounded-xl text-center">
                    <Brain className="mx-auto mb-2 text-purple-400" size={24} />
                    <div className="text-sm text-muted-foreground">Interview Qs</div>
                    <div className="font-bold">{flashcards.length}+</div>
                </div>
                <div className="glass p-4 rounded-xl text-center">
                    <Lightbulb className="mx-auto mb-2 text-yellow-400" size={24} />
                    <div className="text-sm text-muted-foreground">Flashcards</div>
                    <div className="font-bold">{flashcards.length}</div>
                </div>
            </div>

            {/* Flashcards Section */}
            {flashcards.length > 0 && (
                <section className="glass p-8 rounded-2xl bg-gradient-to-br from-zinc-900 to-black">
                    <h2 className="text-center text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                        <Lightbulb className="text-yellow-400" /> Interview Flashcards
                    </h2>
                    <p className="text-center text-muted-foreground mb-6">Click to flip and test yourself!</p>
                    <FlashcardDeck cards={flashcards} />
                </section>
            )}

            {/* Main Content */}
            <article className="glass-card p-8 md:p-12 prose prose-invert prose-headings:text-primary prose-a:text-blue-400 prose-code:text-green-400 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10 max-w-none">
                <ReactMarkdown
                    components={{
                        // Custom code block styling
                        pre: ({ node, ...props }) => (
                            <pre className="overflow-x-auto p-4 rounded-xl bg-zinc-900/80 border border-white/10" {...props} />
                        ),
                        code: ({ node, className, children, ...props }) => {
                            const isInline = !className;
                            return isInline ? (
                                <code className="bg-white/10 px-1.5 py-0.5 rounded text-green-400" {...props}>{children}</code>
                            ) : (
                                <code className={className} {...props}>{children}</code>
                            );
                        },
                        table: ({ node, ...props }) => (
                            <div className="overflow-x-auto my-6">
                                <table className="min-w-full" {...props} />
                            </div>
                        ),
                        th: ({ node, ...props }) => (
                            <th className="bg-white/5 px-4 py-2 text-left border-b border-white/10" {...props} />
                        ),
                        td: ({ node, ...props }) => (
                            <td className="px-4 py-2 border-b border-white/5" {...props} />
                        ),
                    }}
                >
                    {noteData.content}
                </ReactMarkdown>
            </article>

            {/* Related Problems CTA */}
            <div className="glass-card p-8 text-center">
                <h3 className="text-xl font-bold mb-2">Ready to Practice?</h3>
                <p className="text-muted-foreground mb-4">Apply what you've learned with related problems.</p>
                <Link
                    href={`/topic/${encodeURIComponent(topic)}`}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 px-6 py-3 rounded-full font-bold transition-all"
                >
                    View {topic} Problems
                </Link>
            </div>
        </div>
    );
}
