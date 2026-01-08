"use client";

import { useState } from 'react';
import { Problem } from '@/types';
import { CheckCircle2, Circle, ExternalLink, Bot, X, Loader2 } from 'lucide-react';
import { useProgress } from '@/hooks/useProgress';
import { motion, AnimatePresence } from 'framer-motion';

interface ProblemCardProps {
    problem: Problem;
    showCheckbox?: boolean;
}

export default function ProblemCard({ problem, showCheckbox = true }: ProblemCardProps) {
    const { isProblemCompleted, toggleProblem, addToRevision } = useProgress();
    const [loading, setLoading] = useState(false);
    const [solution, setSolution] = useState<string | null>(null);
    const [showSolution, setShowSolution] = useState(false);

    const isDone = isProblemCompleted(problem.id);

    const handleToggle = () => {
        const wasCompleted = isDone;
        toggleProblem(problem.id);

        // If marking as complete, add to revision system
        if (!wasCompleted) {
            addToRevision(problem.id, problem.title, 'problem');
        }
    };

    const fetchSolution = async () => {
        if (solution) {
            setShowSolution(true);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/solution', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problemTitle: problem.title, difficulty: problem.difficulty })
            });
            const data = await res.json();
            if (data.solution) {
                setSolution(data.solution);
                setShowSolution(true);
            } else {
                alert(data.error || "Failed to get solution");
            }
        } catch (e) {
            alert("Error fetching solution");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={`glass p-3 sm:p-4 rounded-xl transition-all border ${isDone && showCheckbox ? 'border-green-500/30 bg-green-500/5' : 'border-white/5 hover:border-white/20'}`}>
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
                        {showCheckbox && (
                            <button onClick={handleToggle} className={`mt-0.5 p-1 -ml-1 transition-colors shrink-0 ${isDone ? 'text-green-500' : 'text-zinc-600 hover:text-zinc-400'}`}>
                                {isDone ? <CheckCircle2 size={22} className="sm:w-6 sm:h-6" /> : <Circle size={22} className="sm:w-6 sm:h-6" />}
                            </button>
                        )}
                        <div className='flex-1 min-w-0'>
                            <h5 className={`font-semibold text-sm sm:text-base md:text-lg truncate ${isDone && showCheckbox ? 'line-through text-muted-foreground' : ''}`}>{problem.title}</h5>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-muted-foreground flex-wrap">
                                <span className={`px-1.5 sm:px-2 py-0.5 rounded ${problem.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' :
                                    problem.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                        'bg-red-500/10 text-red-400'
                                    }`}>{problem.difficulty}</span>
                                <span className="hidden sm:inline text-zinc-600">|</span>
                                {problem.topics.slice(0, 2).map(t => <span key={t} className="bg-white/5 px-1 sm:px-1.5 rounded hidden xs:inline">{t}</span>)}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                        <button
                            onClick={fetchSolution}
                            disabled={loading}
                            className="p-2.5 sm:p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1.5 sm:gap-2 text-xs font-medium min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 justify-center"
                            title="Get AI Solution"
                        >
                            {loading ? <Loader2 size={18} className='animate-spin' /> : <Bot size={18} />}
                            <span className="hidden md:inline">Solution</span>
                        </button>

                        <a href={problem.link} target="_blank" rel="noopener noreferrer" className="p-2.5 sm:p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors text-muted-foreground hover:text-white min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center" title="View Problem">
                            <ExternalLink size={18} />
                        </a>
                    </div>
                </div>
            </div>

            {/* Solution Modal/Drawer */}
            <AnimatePresence>
                {showSolution && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                        onClick={() => setShowSolution(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-zinc-900 sticky top-0">
                                <h3 className="text-xl font-bold flex items-center gap-2"><Bot className="text-primary" /> AI Solution: {problem.title}</h3>
                                <button onClick={() => setShowSolution(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X /></button>
                            </div>
                            <div className="p-6 overflow-y-auto font-mono text-sm leading-relaxed whitespace-pre-wrap text-zinc-300">
                                {solution}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
