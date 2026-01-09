"use client";

import { DailyTask, Problem, Question, Flashcard } from '@/types';
import { useProgress } from '@/hooks/useProgress';
import { CheckCircle2, Circle, Code, Brain, BookOpen, Sword, Layers, Lightbulb, PenTool } from 'lucide-react';

import { useState } from 'react';
import ProblemCard from '@/components/ProblemCard';
import FlashcardDeck from '@/components/FlashcardDeck';
import QuizView from '@/components/QuizView';
import ShortNotes from '@/components/ShortNotes';

interface DayViewProps {
    day: DailyTask;
    problems: Problem[];
    extraProblems?: Problem[];
    notes?: { title: string; content: string } | null;
    questions?: Question[];
    flashcards?: Flashcard[];
}

export default function DayView({ day, problems, extraProblems = [], notes, questions = [], flashcards = [] }: DayViewProps) {
    const { isProblemCompleted, toggleProblem, isAptitudeCompleted, toggleAptitude, isReasoningCompleted, toggleReasoning } = useProgress();
    const [activeTab, setActiveTab] = useState<'plan' | 'notes' | 'extras' | 'quiz'>('plan');

    return (
        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <header>
                <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                    <span className="text-xs sm:text-sm font-mono text-primary">DAY {day.day}</span>
                    {day.type === 'Holiday' && <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 uppercase tracking-wider font-bold">Holiday Schedule</span>}
                    {day.type === 'Work' && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-wider font-bold">Work Day</span>}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">{day.title}</h1>

                {/* Tabs */}
                <div className="flex items-center gap-1 border-b border-white/10 mb-6 md:mb-8 overflow-x-auto pb-px -mx-2 px-2 scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('plan')}
                        className={`px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'plan' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white'}`}
                    >
                        <Layers size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden xs:inline">Daily</span> Plan
                    </button>
                    {notes && (
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'notes' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white'}`}
                        >
                            <BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" /> Short Notes
                        </button>
                    )}
                    {questions.length > 0 && (
                        <button
                            onClick={() => setActiveTab('quiz')}
                            className={`px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'quiz' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white'}`}
                        >
                            <PenTool size={16} className="sm:w-[18px] sm:h-[18px]" /> Quiz
                        </button>
                    )}
                    {extraProblems.length > 0 && (
                        <button
                            onClick={() => setActiveTab('extras')}
                            className={`px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2 border-b-2 transition-colors whitespace-nowrap text-sm sm:text-base ${activeTab === 'extras' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-white'}`}
                        >
                            <Sword size={16} className="sm:w-[18px] sm:h-[18px]" /> <span className="hidden sm:inline">Challenge</span><span className="sm:hidden">Extra</span>
                        </button>
                    )}
                </div>
            </header>

            {activeTab === 'plan' && (
                <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
                    {/* Java + DSA Section */}
                    <section className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold text-blue-400">
                            <Code size={20} className="sm:w-6 sm:h-6" /> 2 hrs Java + DSA
                        </div>

                        <div className="glass-card p-4 sm:p-6 space-y-3 sm:space-y-4">
                            <h3 className="text-lg sm:text-xl font-semibold">{day.javaDSA.topic}</h3>
                            <p className="text-sm sm:text-base text-muted-foreground">{day.javaDSA.description}</p>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {day.javaDSA.concepts.map(c => (
                                    <span key={c} className="bg-blue-500/10 text-blue-300 px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs border border-blue-500/20">{c}</span>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold text-muted-foreground uppercase text-xs sm:text-sm tracking-wider">Problems</h4>
                            {problems.map(problem => (
                                <ProblemCard key={problem.id} problem={problem} />
                            ))}
                        </div>
                    </section>

                    {/* Aptitude & Reasoning Section */}
                    <section className="space-y-4 sm:space-y-6">
                        <div className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl font-bold text-purple-400">
                            <Brain size={20} className="sm:w-6 sm:h-6" /> 2 hrs Aptitude
                        </div>

                        <div className="glass-card p-4 sm:p-6 border-l-4 border-l-purple-500">
                            <h3 className="text-lg sm:text-xl font-bold mb-2">Today's Focus</h3>
                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <div className="text-xs sm:text-sm text-purple-300 font-semibold uppercase tracking-wider mb-1">Aptitude</div>
                                    <div className="text-base sm:text-lg">{day.aptitude.topic}</div>
                                </div>
                                <div>
                                    <div className="text-xs sm:text-sm text-purple-300 font-semibold uppercase tracking-wider mb-1">Reasoning</div>
                                    <div className="text-base sm:text-lg">{day.reasoning.topic}</div>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-6">
                                <button onClick={() => setActiveTab('quiz')} className="w-full py-2.5 sm:py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors font-bold flex items-center justify-center gap-2 text-sm sm:text-base">
                                    <PenTool size={16} className="sm:w-[18px] sm:h-[18px]" /> Solve Practice Questions
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'notes' && notes && (
                <div className="space-y-8">
                    {flashcards.length > 0 && (
                        <div className="glass p-6 sm:p-8 rounded-xl bg-gradient-to-br from-zinc-900 to-black border border-yellow-500/20">
                            <h3 className="text-center text-xl font-bold mb-2 flex items-center justify-center gap-2"><Lightbulb className="text-yellow-400" /> Quick Flashcards</h3>
                            <p className="text-center text-muted-foreground text-sm mb-4">Tap card to flip • Quick revision before deep dive</p>
                            <FlashcardDeck cards={flashcards} />
                        </div>
                    )}
                    <div className="glass-card p-6 sm:p-8 overflow-hidden">
                        <ShortNotes title={notes.title} content={notes.content} />
                    </div>
                </div>
            )}

            {activeTab === 'quiz' && (
                <QuizView questions={questions} />
            )}

            {activeTab === 'extras' && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6 rounded-xl">
                        <h2 className="text-xl font-bold text-amber-500 mb-2 flex items-center gap-2"><Sword size={24} /> Challenge Mode</h2>
                        <p className="text-muted-foreground">These extra problems will solidify your understanding of {day.javaDSA.topic}. They are optional but recommended!</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        {extraProblems.map(p => (
                            <ProblemCard key={p.id} problem={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
