"use client";

import { use, useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, BookOpen, Lightbulb, Code, Brain,
    List, Target, Zap, Info, ChevronRight, Copy, Check
} from 'lucide-react';
import concepts from '@/data/concepts.json';
import FlashcardDeck from '@/components/features/FlashcardDeck';
import { Flashcard } from '@/types';

// Generate flashcards from note content
function generateFlashcards(content: string): Flashcard[] {
    const flashcards: Flashcard[] = [];
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

// Helper to extract headings for TOC
function extractHeadings(content: string) {
    const lines = content.split('\n');
    const headings: { text: string; id: string; level: number }[] = [];
    lines.forEach(line => {
        const match = line.match(/^(##|###) (.+)$/);
        if (match) {
            const text = match[2].replace(/[🎯📌🔥💡📝📦]/g, '').trim();
            const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            headings.push({ text, id, level: match[1].length });
        }
    });
    return headings;
}

export default function NotesPage({ params }: { params: Promise<{ topic: string }> }) {
    const resolvedParams = use(params);
    const topic = decodeURIComponent(resolvedParams.topic);
    const [activeSection, setActiveSection] = useState<string>('');
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // @ts-ignore
    const noteData = concepts[topic];

    const headings = noteData ? extractHeadings(noteData.content) : [];

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-10% 0% -80% 0%' }
        );

        const headingElements = document.querySelectorAll('h2, h3');
        headingElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [noteData]);

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

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Top Navigation & Title */}
            <div className="mb-12 space-y-4">
                <Link href="/topics" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Topics
                </Link>
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-lg text-primary">
                                <BookOpen size={24} />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight">{noteData.title}</h1>
                        </div>
                        <p className="text-xl text-muted-foreground/80 max-w-2xl font-medium">
                            Master {topic} with comprehensive reference sheets, code patterns, and interview strategies.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-12">
                {/* Main Content Column */}
                <div className="space-y-12 order-2 lg:order-1" ref={contentRef}>

                    {/* Hero Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Brain, label: 'Interview Qs', value: `${flashcards.length}+`, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                            { icon: Code, label: 'Code Snippets', value: 'Rich', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                            { icon: List, label: 'Patterns', value: 'Curated', color: 'text-green-400', bg: 'bg-green-400/10' },
                            { icon: Target, label: 'Complexity', value: 'Included', color: 'text-amber-400', bg: 'bg-amber-400/10' },
                        ].map((stat, i) => (
                            <div key={i} className={`glass p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border-white/5`}>
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} mb-1`}>
                                    <stat.icon size={20} />
                                </div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                                <div className="text-xl font-black">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Flashcards Section (Optional) */}
                    {flashcards.length > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-8 rounded-[2.5rem] bg-gradient-to-br from-zinc-900 via-[#0a0a0f] to-primary/10 border-primary/20 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <Zap size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="text-center space-y-2 mb-8">
                                    <span className="bg-primary/20 text-primary text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-primary/30">Active Recall</span>
                                    <h2 className="text-3xl font-black flex items-center justify-center gap-3">
                                        <Lightbulb className="text-yellow-400" /> Interview Flashcards
                                    </h2>
                                    <p className="text-muted-foreground">Master the theory before jumping into the code.</p>
                                </div>
                                <FlashcardDeck cards={flashcards} />
                            </div>
                        </motion.section>
                    )}

                    {/* Main Markdown Content */}
                    <article className="glass-card p-6 md:p-16 prose prose-invert max-w-none 
                        prose-headings:font-black prose-headings:tracking-tight 
                        prose-h2:text-3xl prose-h2:border-b prose-h2:border-white/5 prose-h2:pb-4 prose-h2:mt-12
                        prose-h3:text-xl prose-h3:text-primary/90
                        prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:text-lg
                        prose-strong:text-white prose-strong:font-bold
                        prose-code:text-emerald-400 prose-code:font-mono prose-code:bg-emerald-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                    ">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h2: ({ node, children, ...props }) => {
                                    const text = children?.toString() || '';
                                    const id = text.toLowerCase().replace(/[🎯📌🔥💡📝📦]/g, '').trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                                    let icon = <ChevronRight className="text-primary" />;
                                    if (text.includes('🎯')) icon = <Target className="text-primary" />;
                                    if (text.includes('🔥')) icon = <Zap className="text-orange-400" size={28} />;
                                    if (text.includes('💡')) icon = <Lightbulb className="text-yellow-400" />;
                                    if (text.includes('📦')) icon = <Code className="text-blue-400" />;

                                    return (
                                        <h2 id={id} className="flex items-center gap-3 group scroll-mt-24" {...props}>
                                            <span className="p-2 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">{icon}</span>
                                            {children}
                                        </h2>
                                    );
                                },
                                h3: ({ node, children, ...props }) => {
                                    const text = children?.toString() || '';
                                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
                                    return <h3 id={id} className="scroll-mt-24 flex items-center gap-2" {...props}>{children}</h3>;
                                },
                                pre: ({ node, children, ...props }) => {
                                    // Extract code text from children
                                    const codeElement = (children as any)?.props?.children;
                                    const codeText = typeof codeElement === 'string' ? codeElement.trim() : '';
                                    const id = Math.random().toString(36).substr(2, 9);

                                    return (
                                        <div className="relative group my-8">
                                            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => copyToClipboard(codeText, id)}
                                                    className="p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg border border-white/10 text-white transition-all"
                                                >
                                                    {copiedId === id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                                                </button>
                                            </div>
                                            <div className="absolute top-0 left-6 -translate-y-1/2 bg-zinc-800 px-3 py-1 rounded-md text-[10px] font-bold text-zinc-400 uppercase tracking-widest border border-white/5">
                                                Java Example
                                            </div>
                                            <pre className="!bg-[#0d0d12] !p-6 md:!p-8 rounded-2xl border border-white/5 overflow-x-auto shadow-2xl font-mono text-sm leading-relaxed" {...props}>
                                                {children}
                                            </pre>
                                        </div>
                                    );
                                },
                                table: ({ node, ...props }) => (
                                    <div className="my-10 overflow-hidden rounded-2xl border border-white/5 bg-white/5">
                                        <table className="min-w-full border-collapse" {...props} />
                                    </div>
                                ),
                                th: ({ node, ...props }) => (
                                    <th className="bg-primary/10 px-6 py-4 text-left text-sm font-black uppercase tracking-wider border-b border-white/10 text-primary" {...props} />
                                ),
                                td: ({ node, ...props }) => (
                                    <td className="px-6 py-4 text-sm border-b border-white/5 font-medium" {...props} />
                                ),
                                ul: ({ node, ...props }) => (
                                    <ul className="space-y-3 list-none pl-0 my-6" {...props} />
                                ),
                                li: ({ node, children, ...props }) => (
                                    <li className="flex gap-3 items-start text-muted-foreground" {...props}>
                                        <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                        <span>{children}</span>
                                    </li>
                                ),
                                hr: () => <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-12" />
                            }}
                        >
                            {noteData.content}
                        </ReactMarkdown>
                    </article>

                    {/* End of Notes CTA */}
                    <div className="glass p-10 rounded-[3rem] border-primary/20 text-center space-y-6 relative overflow-hidden bg-gradient-to-t from-primary/10 to-transparent">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black">Knowledge Check!</h3>
                            <p className="text-muted-foreground text-lg">You've covered the theory. Now put it into practice with real interview problems.</p>
                        </div>
                        <Link
                            href={`/topic/${encodeURIComponent(topic)}`}
                            className="inline-flex items-center gap-3 bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-full font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20"
                        >
                            Solve {topic} Problems <Zap size={20} />
                        </Link>
                    </div>
                </div>

                {/* Sidebar Navigation */}
                <aside className="hidden lg:block order-1 lg:order-2">
                    <div className="sticky top-24 space-y-8">
                        {/* TOC */}
                        <div className="glass-card p-6 border-white/5 space-y-6">
                            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                <List size={14} className="text-primary" /> On this page
                            </div>
                            <nav className="space-y-1">
                                {headings.map((h, i) => (
                                    <a
                                        key={i}
                                        href={`#${h.id}`}
                                        className={`block py-2 text-sm transition-all border-l-2 pl-4 ${activeSection === h.id
                                                ? 'text-primary border-primary font-bold bg-primary/5'
                                                : 'text-muted-foreground border-transparent hover:text-white hover:border-white/20'
                                            } ${h.level === 3 ? 'ml-4 text-[13px]' : ''}`}
                                    >
                                        {h.text}
                                    </a>
                                ))}
                            </nav>
                        </div>

                        {/* Quick Study Info */}
                        <div className="glass p-6 rounded-3xl border-dashed border-white/10">
                            <h4 className="flex items-center gap-2 font-bold mb-4 text-sm">
                                <Info size={16} className="text-blue-400" /> Study Goal
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Aim to understand the **core logic** and **time complexity** rather than memorizing code.
                                <br /><br />
                                💡 Tip: Try rewriting the patterns from scratch after reading.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
