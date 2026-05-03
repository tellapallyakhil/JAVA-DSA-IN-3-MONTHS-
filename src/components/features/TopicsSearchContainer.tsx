"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Code, ArrowRight, Search, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TopicsSearchContainerProps {
    topics: string[];
    concepts: any;
}

export default function TopicsSearchContainer({ topics, concepts }: TopicsSearchContainerProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const conceptKeys = Object.keys(concepts);

    const filteredConcepts = useMemo(() => {
        if (!searchTerm) return conceptKeys;
        return conceptKeys.filter(key => 
            key.toLowerCase().includes(searchTerm.toLowerCase()) || 
            concepts[key].title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [conceptKeys, concepts, searchTerm]);

    const filteredTopics = useMemo(() => {
        if (!searchTerm) return topics;
        return topics.filter(topic => 
            topic.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [topics, searchTerm]);

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold flex items-center gap-3">
                        <BookOpen className="text-primary" /> DSA Topics
                    </h1>
                    <p className="text-muted-foreground max-w-xl">Master data structures and algorithms by topic. Explore comprehensive notes and practice problems.</p>
                </div>
                
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search topics or concepts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all shadow-2xl"
                    />
                </div>
            </header>

            {/* Topics with Notes Available */}
            {(filteredConcepts.length > 0) && (
                <section>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Code className="text-green-400" /> Study Notes
                        <span className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded-full border border-green-500/20 ml-2">
                            {filteredConcepts.length}
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredConcepts.map((topic, i) => {
                                const noteData = concepts[topic];
                                const hasFlashcards = noteData.content.includes('**Q:');

                                return (
                                    <motion.div
                                        key={topic}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, delay: i * 0.02 }}
                                    >
                                        <Link
                                            href={`/notes/${encodeURIComponent(topic)}`}
                                            className="glass-card p-6 h-full flex flex-col hover:border-green-500/30 transition-all group relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 blur-2xl -mr-12 -mt-12" />
                                            <div className="flex items-start justify-between relative z-10">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold group-hover:text-green-400 transition-colors">{topic}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{noteData.title}</p>
                                                </div>
                                                <ArrowRight className="text-muted-foreground group-hover:text-green-400 group-hover:translate-x-1 transition-all mt-1" size={20} />
                                            </div>
                                            <div className="mt-auto pt-6 flex items-center gap-2 relative z-10">
                                                <span className="text-[10px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400 px-2 py-1 rounded-md border border-green-500/20">Notes</span>
                                                {hasFlashcards && (
                                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md border border-blue-500/20 flex items-center gap-1">
                                                        <Sparkles size={10} /> Flashcards
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </section>
            )}

            {/* All Topics Grid */}
            {(filteredTopics.length > 0) && (
                <section>
                    <h2 className="text-2xl font-bold mb-6">All Topics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        <AnimatePresence mode="popLayout">
                            {filteredTopics.map((topic, i) => (
                                <motion.div
                                    key={topic}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    transition={{ duration: 0.2, delay: i * 0.01 }}
                                >
                                    <Link
                                        href={`/topic/${encodeURIComponent(topic)}`}
                                        className="glass p-6 rounded-2xl h-full flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-white/5 transition-all group"
                                    >
                                        <span className="font-bold text-sm group-hover:text-primary transition-colors text-center leading-tight">{topic}</span>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>
            )}

            {filteredConcepts.length === 0 && filteredTopics.length === 0 && (
                <div className="min-h-[300px] flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <Search size={48} className="text-zinc-600" />
                    <div>
                        <h3 className="text-xl font-bold">No results found</h3>
                        <p className="text-sm">Try searching for a different topic or algorithm.</p>
                    </div>
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="text-primary font-bold hover:underline"
                    >
                        Clear Search
                    </button>
                </div>
            )}
        </div>
    );
}
