"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashcard } from '@/types';
import { RefreshCw, ArrowRight, ArrowLeft, Zap, Keyboard } from 'lucide-react';

export default function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [direction, setDirection] = useState(0);

    const handleNext = useCallback(() => {
        setDirection(1);
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, [cards.length]);

    const handlePrev = useCallback(() => {
        setDirection(-1);
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, [cards.length]);

    const toggleFlip = useCallback(() => {
        setIsFlipped(prev => !prev);
    }, []);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                toggleFlip();
            } else if (e.code === 'ArrowRight') {
                handleNext();
            } else if (e.code === 'ArrowLeft') {
                handlePrev();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, toggleFlip]);

    if (!cards || cards.length === 0) return <div className="text-muted-foreground italic">No flashcards specialized for this topic yet.</div>;

    return (
        <div className="flex flex-col items-center justify-center space-y-10 py-4 w-full max-w-2xl mx-auto">

            {/* Cards Stage */}
            <div className="relative w-full aspect-[16/10] perspective-2000 group">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: direction * 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -direction * 50 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="w-full h-full relative"
                    >
                        <motion.div
                            className="w-full h-full relative cursor-pointer"
                            onClick={toggleFlip}
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{
                                rotateY: { type: "spring", stiffness: 180, damping: 20 },
                                scale: { duration: 0.1 }
                            }}
                            style={{ transformStyle: 'preserve-3d' }}
                        >
                            {/* Front Overlay Gradient */}
                            <div className="absolute inset-0 z-0 bg-primary/5 rounded-3xl blur-2xl opacity-50 group-hover:opacity-100 transition-opacity" />

                            {/* Front Side */}
                            <div
                                className="absolute inset-0 backface-hidden bg-[#0A0A0F] border-2 border-primary/20 rounded-3xl flex flex-col items-center justify-center p-12 text-center shadow-2xl overflow-hidden z-10"
                                style={{ transform: 'translateZ(1px)' }}
                            >
                                <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 ease-out"
                                        style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                                    />
                                </div>
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-1.5 bg-primary/20 rounded-md text-primary">
                                        <Zap size={14} />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-primary/80 font-black">Active Recall</span>
                                </div>
                                <p className="text-2xl md:text-3xl font-black text-white leading-tight">{cards[currentIndex].front}</p>
                                <div className="absolute bottom-8 text-[10px] text-muted-foreground/60 flex items-center gap-2 font-bold uppercase tracking-widest animate-pulse">
                                    <RefreshCw size={12} /> Click to reveal answer
                                </div>
                            </div>

                            {/* Back Side */}
                            <div
                                className="absolute inset-0 backface-hidden bg-gradient-to-br from-[#0c0c14] to-black border-2 border-emerald-500/20 rounded-3xl flex flex-col items-center justify-center p-12 text-center shadow-2xl z-10"
                                style={{ transform: 'rotateY(180deg) translateZ(1px)' }}
                            >
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="p-1.5 bg-emerald-500/20 rounded-md text-emerald-400">
                                        <RefreshCw size={14} />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-black">Correct Answer</span>
                                </div>
                                <div className="h-[2px] w-12 bg-emerald-500/30 mb-6 rounded-full" />
                                <p className="text-lg md:text-xl text-zinc-300 font-medium leading-relaxed max-w-sm">
                                    {cards[currentIndex].back}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center gap-8 bg-white/5 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/10 shadow-xl">
                <button
                    onClick={handlePrev}
                    className="p-2.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white transition-all active:scale-90"
                    title="Previous (Left Arrow)"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex flex-col items-center">
                    <span className="text-sm font-black text-white">{currentIndex + 1} <span className="text-muted-foreground/40 font-medium">/</span> {cards.length}</span>
                    <div className="flex gap-1 mt-1">
                        {cards.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all duration-300 ${i === currentIndex ? 'w-4 bg-primary' : 'w-1 bg-white/10'}`}
                            />
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleNext}
                    className="p-2.5 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white transition-all active:scale-90"
                    title="Next (Right Arrow)"
                >
                    <ArrowRight size={24} />
                </button>
            </div>

            {/* Hint */}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40 font-bold uppercase tracking-widest">
                <Keyboard size={12} />
                Use arrow keys to navigate & space to flip
            </div>
        </div>
    );
}
