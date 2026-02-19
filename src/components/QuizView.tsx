"use client";

import { useState } from 'react';
import { Question } from '@/types';
import { Check, X, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useProgress } from '@/hooks/useProgress';

interface QuizViewProps {
    questions: Question[];
}

export default function QuizView({ questions }: QuizViewProps) {
    const { progress, toggleQuestion } = useProgress();
    const [selections, setSelections] = useState<Record<string, string>>({});
    const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});

    const handleSelect = (qId: string, option: string) => {
        if (selections[qId]) return;
        setSelections(prev => ({ ...prev, [qId]: option }));

        // Track this question as completed
        if (toggleQuestion && !progress.completedQuestions?.includes(qId)) {
            toggleQuestion(qId);
        }

        const question = questions.find(q => q.id === qId);
        if (question && question.answer === option) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    };

    const toggleExplanation = (qId: string) => {
        setShowExplanation(prev => ({ ...prev, [qId]: !prev[qId] }));
    };

    if (!questions || questions.length === 0) return <div className="text-muted-foreground p-4 text-center">No quiz questions available for this day.</div>;

    return (
        <div className="space-y-8 max-w-3xl mx-auto">
            {questions.map((q, index) => {
                const isAnswered = !!selections[q.id];
                const isCorrect = selections[q.id] === q.answer;

                return (
                    <div key={q.id} className="glass p-6 rounded-xl border border-white/5 relative overflow-hidden">
                        <div className="flex items-start gap-4 mb-6">
                            <span className="bg-white/5 w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold shrink-0">{index + 1}</span>
                            <div>
                                <h3 className="text-lg font-medium leading-relaxed">{q.question}</h3>
                                <div className="mt-2 text-xs text-muted-foreground bg-white/5 inline-block px-2 py-1 rounded">{q.topic}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-12">
                            {q.options.map((opt, idx) => {
                                const isSelected = selections[q.id] === opt;
                                const isTheCorrectAnswer = opt === q.answer;

                                let buttonClass = "p-4 rounded-lg border text-left transition-all relative ";
                                if (isAnswered) {
                                    if (isTheCorrectAnswer) buttonClass += "bg-green-500/10 border-green-500/50 text-green-400";
                                    else if (isSelected) buttonClass += "bg-red-500/10 border-red-500/50 text-red-400";
                                    else buttonClass += "bg-white/5 border-transparent opacity-50";
                                } else {
                                    buttonClass += "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20";
                                }

                                return (
                                    <button
                                        key={`${q.id}-opt-${idx}`}
                                        onClick={() => handleSelect(q.id, opt)}
                                        disabled={isAnswered}
                                        className={buttonClass}
                                    >
                                        {opt}
                                        {isAnswered && isTheCorrectAnswer && <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />}
                                        {isAnswered && isSelected && !isTheCorrectAnswer && <X size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" />}
                                    </button>
                                );
                            })}
                        </div>

                        <AnimatePresence>
                            {isAnswered && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    className="pl-12 mt-4 overflow-hidden"
                                >
                                    <div className={`p-4 rounded-lg text-sm border ${isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                                        <div className="font-bold flex items-center gap-2 mb-1">
                                            {isCorrect ? <span className="text-green-400">Correct!</span> : <span className="text-red-400">Incorrect</span>}
                                        </div>
                                        <p className="text-muted-foreground">{q.explanation}</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
