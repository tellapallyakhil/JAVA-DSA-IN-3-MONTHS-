"use client";

import { useState } from 'react';
import { useProgress } from '@/hooks/useProgress';
import topicResourcesData from '@/data/topicResources.json';
import {
    BookOpen, Brain, Code2, Lightbulb, AlertTriangle,
    ChevronDown, ChevronUp, CheckCircle2, Circle, Lock,
    Bookmark, RefreshCw, Layers, X, Plus
} from 'lucide-react';

interface TopicResource {
    id: string;
    name: string;
    icon: string;
    theoryRecap: string;
    patterns: { name: string; description: string; whenToUse: string; example: string }[];
    codeTemplates: { name: string; code: string }[];
    analogies: { concept: string; analogy: string }[];
    cheatSheet: {
        timeComplexity: { [key: string]: string };
        spaceComplexity?: string;
        bestFor?: string[];
        avoidWhen?: string[];
        javaClasses?: string[];
        steps?: string[];
    };
    commonMistakes: { mistake: string; description: string; fix: string }[];
    flashcards: { front: string; back: string }[];
    levels: { level: number; name: string; problems: string[] }[];
}

const topics = (topicResourcesData as unknown as { topics: { [key: string]: TopicResource } }).topics;

export default function TopicFocusMode() {
    const {
        progress,
        markTopicAsWeak,
        removeWeakTopic,
        completeTopicProblem,
        reviewFlashcard,
        isTopicWeak
    } = useProgress();

    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'theory' | 'patterns' | 'templates' | 'practice' | 'flashcards' | 'mistakes'>('theory');
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [currentFlashcard, setCurrentFlashcard] = useState(0);
    const [showFlashcardBack, setShowFlashcardBack] = useState(false);

    // Helper to handle topic selection with flashcard reset
    const handleSelectTopic = (topicId: string) => {
        setSelectedTopic(topicId);
        setCurrentFlashcard(0);
        setShowFlashcardBack(false);
        setActiveTab('theory');
        setExpandedSections([]);
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev =>
            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
        );
    };

    const weakTopicsList = progress.weakTopics || [];
    const topicProgress = progress.topicProgress || {};

    // Get topic data
    const getTopicData = (topicId: string): TopicResource | null => {
        return topics[topicId] || null;
    };

    const selectedTopicData = selectedTopic ? getTopicData(selectedTopic) : null;

    // Safety check for flashcard index
    const safeFlashcardIndex = selectedTopicData
        ? Math.min(currentFlashcard, selectedTopicData.flashcards.length - 1)
        : 0;

    // Calculate progress percentage for a topic
    const getTopicProgressPercent = (topicId: string): number => {
        const tp = topicProgress[topicId];
        if (!tp) return 0;
        const topic = getTopicData(topicId);
        if (!topic) return 0;
        const totalProblems = topic.levels.reduce((sum, lvl) => sum + lvl.problems.length, 0);
        return Math.round((tp.completedProblems.length / totalProblems) * 100);
    };

    return (
        <div className="space-y-6 md:space-y-8">
            {/* Header */}
            <div className="text-center space-y-2 px-2">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                    🎯 Topic Focus Mode
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    Mark topics you're weak in and get personalized learning resources
                </p>
            </div>

            {/* Topic Selection Grid */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Bookmark className="text-primary" size={20} />
                    Select Topics to Focus On
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                    {Object.values(topics).map((topic) => {
                        const isWeak = isTopicWeak(topic.id);
                        const progressPercent = getTopicProgressPercent(topic.id);

                        return (
                            <div
                                key={topic.id}
                                onClick={() => {
                                    if (!isWeak) {
                                        markTopicAsWeak(topic.id);
                                    }
                                    handleSelectTopic(topic.id);
                                }}
                                className={`relative p-4 rounded-xl border transition-all text-center cursor-pointer ${isWeak
                                    ? 'bg-primary/20 border-primary/50 hover:bg-primary/30'
                                    : 'bg-white/5 border-white/10 hover:border-primary/30'
                                    } ${selectedTopic === topic.id ? 'ring-2 ring-primary' : ''}`}
                            >
                                <div className="text-2xl mb-2">{topic.icon}</div>
                                <div className="font-medium text-sm">{topic.name}</div>
                                {isWeak && (
                                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                )}
                                {isWeak && (
                                    <div
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeWeakTopic(topic.id);
                                            if (selectedTopic === topic.id) setSelectedTopic(null);
                                        }}
                                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 cursor-pointer"
                                    >
                                        <X size={12} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* My Focus Areas Summary */}
            {weakTopicsList.length > 0 && (
                <div className="glass rounded-2xl p-4 sm:p-6 space-y-4">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        🔥 My Focus Areas ({weakTopicsList.length})
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {weakTopicsList.map(topicId => {
                            const topic = getTopicData(topicId);
                            const tp = topicProgress[topicId];
                            if (!topic) return null;

                            return (
                                <div
                                    key={topicId}
                                    onClick={() => handleSelectTopic(topicId)}
                                    className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTopic === topicId
                                        ? 'bg-primary/20 border-primary'
                                        : 'bg-white/5 border-white/10 hover:border-primary/30'
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-2xl">{topic.icon}</span>
                                        <div>
                                            <div className="font-medium">{topic.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                Level {tp?.currentLevel || 1} • {tp?.completedProblems.length || 0} problems done
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all"
                                            style={{ width: `${getTopicProgressPercent(topicId)}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Topic Detail View */}
            {selectedTopicData && (
                <div className="glass rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-3">
                            <span className="text-3xl">{selectedTopicData.icon}</span>
                            {selectedTopicData.name} Resources
                        </h2>
                        <button
                            onClick={() => setSelectedTopic(null)}
                            className="p-2 hover:bg-white/10 rounded-lg"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tab Navigation - Horizontal scroll on mobile */}
                    <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
                        <div className="flex gap-2 min-w-max sm:flex-wrap">
                            {[
                                { id: 'theory', label: 'Theory', icon: BookOpen },
                                { id: 'patterns', label: 'Patterns', icon: Layers },
                                { id: 'templates', label: 'Code', icon: Code2 },
                                { id: 'practice', label: 'Practice', icon: RefreshCw },
                                { id: 'flashcards', label: 'Cards', icon: Brain },
                                { id: 'mistakes', label: 'Errors', icon: AlertTriangle },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-primary text-white'
                                        : 'bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <tab.icon size={14} className="sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">{tab.label}</span>
                                    <span className="sm:hidden">{tab.label.slice(0, 5)}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[400px]">
                        {/* Theory Tab */}
                        {activeTab === 'theory' && (
                            <div className="space-y-6">
                                {/* Theory Recap */}
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <BookOpen size={18} className="text-primary" />
                                        Quick Theory Recap
                                    </h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {selectedTopicData.theoryRecap}
                                    </p>
                                </div>

                                {/* Real-World Analogies */}
                                <div className="p-4 bg-white/5 rounded-xl">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <Lightbulb size={18} className="text-yellow-400" />
                                        Real-World Analogies
                                    </h3>
                                    <div className="space-y-3">
                                        {selectedTopicData.analogies.map((analogy, i) => (
                                            <div key={i} className="flex gap-3">
                                                <div className="font-medium text-primary min-w-fit">{analogy.concept}:</div>
                                                <div className="text-muted-foreground">{analogy.analogy}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Cheat Sheet */}
                                <div className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
                                    <h3 className="font-semibold mb-3">📋 Cheat Sheet</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <div className="font-medium text-primary mb-2">Time Complexity</div>
                                            {Object.entries(selectedTopicData.cheatSheet.timeComplexity).map(([op, tc]) => (
                                                <div key={op} className="flex justify-between text-muted-foreground">
                                                    <span className="capitalize">{op}:</span>
                                                    <span className="font-mono">{tc}</span>
                                                </div>
                                            ))}
                                        </div>
                                        {selectedTopicData.cheatSheet.bestFor && (
                                            <div>
                                                <div className="font-medium text-green-400 mb-2">✅ Best For</div>
                                                <ul className="text-muted-foreground space-y-1">
                                                    {selectedTopicData.cheatSheet.bestFor.map((item, i) => (
                                                        <li key={i}>• {item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {selectedTopicData.cheatSheet.avoidWhen && (
                                            <div>
                                                <div className="font-medium text-red-400 mb-2">❌ Avoid When</div>
                                                <ul className="text-muted-foreground space-y-1">
                                                    {selectedTopicData.cheatSheet.avoidWhen.map((item, i) => (
                                                        <li key={i}>• {item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {selectedTopicData.cheatSheet.javaClasses && (
                                            <div>
                                                <div className="font-medium text-blue-400 mb-2">☕ Java Classes</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedTopicData.cheatSheet.javaClasses.map((cls, i) => (
                                                        <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs font-mono">
                                                            {cls}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Patterns Tab */}
                        {activeTab === 'patterns' && (
                            <div className="space-y-4">
                                {selectedTopicData.patterns.map((pattern, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-xl">
                                        <button
                                            onClick={() => toggleSection(`pattern-${i}`)}
                                            className="w-full flex items-center justify-between"
                                        >
                                            <h3 className="font-semibold text-primary">{pattern.name}</h3>
                                            {expandedSections.includes(`pattern-${i}`) ? <ChevronUp /> : <ChevronDown />}
                                        </button>
                                        {expandedSections.includes(`pattern-${i}`) && (
                                            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                                                <p>{pattern.description}</p>
                                                <div>
                                                    <span className="font-medium text-white">When to use: </span>
                                                    {pattern.whenToUse}
                                                </div>
                                                <div>
                                                    <span className="font-medium text-white">Examples: </span>
                                                    {pattern.example}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Templates Tab */}
                        {activeTab === 'templates' && (
                            <div className="space-y-4">
                                {selectedTopicData.codeTemplates.map((template, i) => (
                                    <div key={i} className="p-3 sm:p-4 bg-white/5 rounded-xl">
                                        <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
                                            <Code2 size={16} className="sm:w-[18px] sm:h-[18px] text-green-400" />
                                            {template.name}
                                        </h3>
                                        <pre className="p-3 sm:p-4 bg-black/50 rounded-lg text-xs sm:text-sm overflow-x-auto font-mono text-green-300">
                                            {template.code}
                                        </pre>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Practice Tab (Difficulty Ladder) */}
                        {activeTab === 'practice' && (
                            <div className="space-y-4">
                                {selectedTopicData.levels.map((level, i) => {
                                    const tp = topicProgress[selectedTopic!];
                                    const currentLevel = tp?.currentLevel || 1;
                                    const isUnlocked = level.level <= currentLevel;
                                    const completedProblems = tp?.completedProblems || [];

                                    return (
                                        <div
                                            key={i}
                                            className={`p-4 rounded-xl border ${isUnlocked
                                                ? 'bg-white/5 border-white/10'
                                                : 'bg-white/5 border-white/5 opacity-50'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-semibold flex items-center gap-2">
                                                    {isUnlocked ? (
                                                        <CheckCircle2 className="text-green-400" size={18} />
                                                    ) : (
                                                        <Lock className="text-muted-foreground" size={18} />
                                                    )}
                                                    Level {level.level}: {level.name}
                                                </h3>
                                                <span className="text-sm text-muted-foreground">
                                                    {level.problems.filter(p => completedProblems.includes(p)).length}/{level.problems.length}
                                                </span>
                                            </div>
                                            <div className="space-y-2">
                                                {level.problems.map((problem, j) => {
                                                    const isCompleted = completedProblems.includes(problem);
                                                    return (
                                                        <div
                                                            key={j}
                                                            className="flex items-center justify-between p-2 bg-white/5 rounded-lg"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {isCompleted ? (
                                                                    <CheckCircle2 className="text-green-400" size={16} />
                                                                ) : (
                                                                    <Circle className="text-muted-foreground" size={16} />
                                                                )}
                                                                <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>
                                                                    {problem}
                                                                </span>
                                                            </div>
                                                            {isUnlocked && !isCompleted && (
                                                                <button
                                                                    onClick={() => completeTopicProblem(selectedTopic!, problem)}
                                                                    className="text-xs px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded-full"
                                                                >
                                                                    Mark Done
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Flashcards Tab */}
                        {activeTab === 'flashcards' && selectedTopicData.flashcards.length > 0 && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div
                                    className="w-full max-w-md aspect-[3/2] cursor-pointer perspective-1000 group"
                                    onClick={() => setShowFlashcardBack(!showFlashcardBack)}
                                >
                                    <div
                                        className={`relative w-full h-full transition-all duration-500 transform-style-3d ${showFlashcardBack ? 'rotate-y-180' : ''
                                            }`}
                                    >
                                        {/* Front Face */}
                                        <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                                ❓ Question
                                            </p>
                                            <p className="text-base sm:text-lg font-medium">
                                                {selectedTopicData.flashcards[safeFlashcardIndex]?.front}
                                            </p>
                                        </div>

                                        {/* Back Face */}
                                        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                                                💡 Answer
                                            </p>
                                            <p className="text-base sm:text-lg font-medium">
                                                {selectedTopicData.flashcards[safeFlashcardIndex]?.back}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-4">
                                    Tap card to flip • {safeFlashcardIndex + 1} / {selectedTopicData.flashcards.length}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-4 w-full sm:w-auto">
                                    <button
                                        onClick={() => {
                                            setCurrentFlashcard(prev => prev > 0 ? prev - 1 : selectedTopicData.flashcards.length - 1);
                                            setShowFlashcardBack(false);
                                        }}
                                        className="flex-1 sm:flex-none px-4 py-3 sm:py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                                    >
                                        ← Previous
                                    </button>
                                    <button
                                        onClick={() => {
                                            reviewFlashcard(selectedTopic!);
                                            setCurrentFlashcard(prev => (prev + 1) % selectedTopicData.flashcards.length);
                                            setShowFlashcardBack(false);
                                        }}
                                        className="flex-1 sm:flex-none px-4 py-3 sm:py-2 bg-primary rounded-lg hover:bg-primary/80 transition-colors"
                                    >
                                        Next →
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {topicProgress[selectedTopic!]?.flashcardsReviewed || 0} flashcards reviewed
                                </p>
                            </div>
                        )}

                        {/* Common Mistakes Tab */}
                        {activeTab === 'mistakes' && (
                            <div className="space-y-4">
                                {selectedTopicData.commonMistakes.map((mistake, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-xl border-l-4 border-red-500">
                                        <h3 className="font-semibold text-red-400 mb-2">
                                            ❌ {mistake.mistake}
                                        </h3>
                                        <p className="text-muted-foreground text-sm mb-2">
                                            {mistake.description}
                                        </p>
                                        <div className="text-sm">
                                            <span className="font-medium text-green-400">✅ Fix: </span>
                                            <span className="text-muted-foreground">{mistake.fix}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {weakTopicsList.length === 0 && !selectedTopic && (
                <div className="text-center py-12 text-muted-foreground">
                    <Brain size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Click on any topic above to mark it as a focus area</p>
                    <p className="text-sm">You'll get personalized learning resources!</p>
                </div>
            )}
        </div>
    );
}

