"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Flashcard } from '@/types';
import { RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';

export default function FlashcardDeck({ cards }: { cards: Flashcard[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!cards || cards.length === 0) return <div className="text-muted-foreground italic">No flashcards for this day.</div>;

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % cards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-8 w-full max-w-lg mx-auto">
            <div className="relative w-full aspect-[3/2] cursor-pointer perspective-1000" onClick={() => setIsFlipped(!isFlipped)}>
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-primary/20 to-purple-900/20 border border-primary/30 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-[0_0_30px_-5px_rgba(124,58,237,0.3)]">
                        <span className="text-xs uppercase tracking-widest text-primary mb-4 font-bold">Concept</span>
                        <p className="text-2xl font-bold text-white">{cards[currentIndex].front}</p>
                        <div className="absolute bottom-4 text-xs text-muted-foreground flex items-center gap-1">
                            <RefreshCw size={12} /> Click to flip
                        </div>
                    </div>

                    {/* Back */}
                    <div
                        className="absolute inset-0 backface-hidden bg-zinc-900 border border-white/10 rounded-2xl flex flex-col items-center justify-center p-8 text-center shadow-xl"
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <span className="text-xs uppercase tracking-widest text-green-400 mb-4 font-bold">Explanation</span>
                        <p className="text-lg text-zinc-300 leading-relaxed">{cards[currentIndex].back}</p>
                    </div>
                </motion.div>
            </div>

            <div className="flex items-center gap-6">
                <button onClick={handlePrev} className="p-3 rounded-full hover:bg-white/5 transition-colors"><ArrowLeft /></button>
                <span className="text-sm font-mono text-muted-foreground">{currentIndex + 1} / {cards.length}</span>
                <button onClick={handleNext} className="p-3 rounded-full hover:bg-white/5 transition-colors"><ArrowRight /></button>
            </div>
        </div>
    );
}
