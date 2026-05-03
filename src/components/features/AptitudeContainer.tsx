"use client";

import { useState, useMemo, useEffect } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Calculator, MessageSquare, Puzzle, ChevronRight, CheckCircle2, BookOpen, Lightbulb, ArrowLeft, Sparkles, Building2, BarChart3, Loader2, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

// ─── TYPES ──────────────────────────────────────────────────────────────────
interface Question { q: string; options: string[]; answer: string; explanation: string; companies: string[]; }
interface Topic { id: string; title: string; emoji: string; questions: Question[]; }

// ─── DATA ────────────────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: 'quantitative', label: 'Quantitative Aptitude', icon: Calculator, color: 'emerald', gradient: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20' },
    { id: 'logical', label: 'Logical Reasoning', icon: Puzzle, color: 'blue', gradient: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/20' },
    { id: 'verbal', label: 'Verbal Ability', icon: MessageSquare, color: 'purple', gradient: 'from-purple-500/20 to-pink-500/10', border: 'border-purple-500/20' },
    { id: 'di', label: 'Data Interpretation', icon: BarChart3, color: 'amber', gradient: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/20' },
];

const TOPIC_MAPPING: Record<string, string> = {
    'Percentages': 'Percentages', 'Profit & Loss': 'Profit & Loss', 'Ratio & Proportion': 'Ratio & Proportion',
    'Averages': 'Averages', 'Time & Work': 'Time & Work', 'Work & Wages': 'Time & Work', 'Pipes & Cisterns': 'Time & Work',
    'Time Speed Distance': 'Time, Speed & Distance', 'Speed Time Distance': 'Time, Speed & Distance',
    'Trains': 'Time, Speed & Distance', 'Boats & Streams': 'Time, Speed & Distance',
    'Simple Interest': 'Simple & Compound Interest', 'Compound Interest': 'Simple & Compound Interest',
    'Numbers & Decimal Fractions': 'Number System', 'HCF & LCM': 'Number System', 'Numbers': 'Number System',
    'Simplification & Approximation': 'Simplification & Approximation', 'Algebra': 'Algebra', 'Geometry': 'Algebra',
    'Mensuration': 'Algebra', 'Probability': 'Probability', 'Permutation Combination': 'Permutation & Combination',
    'Permutation & Combination': 'Permutation & Combination', 'Partnership': 'Ratio & Proportion',
    'Stocks & Shares': 'Simple & Compound Interest', 'Ages': 'Averages', 'Mixtures': 'Averages',
    'Number Series': 'Number Series / Pattern Finding', 'Alphabet Series': 'Number Series / Pattern Finding',
    'Series Completion': 'Number Series / Pattern Finding', 'Coding Decoding': 'Coding-Decoding',
    'Blood Relations': 'Blood Relations', 'Direction Sense': 'Direction Sense', 'Seating Arrangement': 'Seating Arrangement',
    'Puzzle': 'Puzzles', 'Puzzles': 'Puzzles', 'Analytical Reasoning': 'Puzzles', 'Syllogism': 'Syllogisms',
    'Statement Conclusion': 'Statement-Conclusion / Assumption', 'Statement & Assumptions': 'Statement-Conclusion / Assumption',
    'Statement Assumptions': 'Statement-Conclusion / Assumption', 'Statement Arguments': 'Statement-Conclusion / Assumption',
    'Course of Action': 'Statement-Conclusion / Assumption', 'Data Sufficiency': 'Data Sufficiency',
    'Logical Reasoning': 'Logical Reasoning', 'Logical Sequence': 'Logical Reasoning', 'Analogy': 'Logical Reasoning',
    'Classification': 'Logical Reasoning', 'Mirror Image': 'Logical Reasoning', 'Venn Diagram': 'Logical Reasoning',
    'Ranking': 'Logical Reasoning', 'Input Output': 'Logical Reasoning', 'Cubes': 'Logical Reasoning',
    'Cube & Dice': 'Logical Reasoning', 'Critical Reasoning': 'Logical Reasoning',
    'Reading Comprehension': 'Reading Comprehension', 'Verbal Reasoning': 'Sentence Correction',
    'Inequality': 'Sentence Correction', 'Para Jumbles': 'Para Jumbles', 'Synonyms & Antonyms': 'Synonyms & Antonyms',
    'Synonyms': 'Synonyms & Antonyms', 'Antonyms': 'Synonyms & Antonyms', 'Data Interpretation': 'Tables & Graphs',
};

const TOPIC_CONFIG: Record<string, { category: string, emoji: string }> = {
    'Percentages': { category: 'quantitative', emoji: '📊' }, 'Profit & Loss': { category: 'quantitative', emoji: '💰' },
    'Ratio & Proportion': { category: 'quantitative', emoji: '⚖️' }, 'Averages': { category: 'quantitative', emoji: '📐' },
    'Time & Work': { category: 'quantitative', emoji: '⏱️' }, 'Time, Speed & Distance': { category: 'quantitative', emoji: '🚗' },
    'Simple & Compound Interest': { category: 'quantitative', emoji: '🏦' }, 'Number System': { category: 'quantitative', emoji: '🔢' },
    'Simplification & Approximation': { category: 'quantitative', emoji: '🧮' }, 'Algebra': { category: 'quantitative', emoji: '📝' },
    'Probability': { category: 'quantitative', emoji: '🎲' }, 'Permutation & Combination': { category: 'quantitative', emoji: '🔀' },
    'Number Series / Pattern Finding': { category: 'logical', emoji: '🔢' }, 'Coding-Decoding': { category: 'logical', emoji: '🔐' },
    'Blood Relations': { category: 'logical', emoji: '👨‍👩‍👧‍👦' }, 'Direction Sense': { category: 'logical', emoji: '🧭' },
    'Seating Arrangement': { category: 'logical', emoji: '💺' }, 'Puzzles': { category: 'logical', emoji: '🧩' },
    'Syllogisms': { category: 'logical', emoji: '🧠' }, 'Statement-conclusion / assumption': { category: 'logical', emoji: '📢' },
    'Data Sufficiency': { category: 'logical', emoji: '✅' }, 'Logical Reasoning': { category: 'logical', emoji: '🧠' },
    'Reading Comprehension': { category: 'verbal', emoji: '📰' }, 'Para Jumbles': { category: 'verbal', emoji: '🔀' },
    'Sentence Correction': { category: 'verbal', emoji: '✏️' }, 'Error Detection': { category: 'verbal', emoji: '🚫' },
    'Fill in the blanks': { category: 'verbal', emoji: '🖋️' }, 'Synonyms & Antonyms': { category: 'verbal', emoji: '📖' },
    'Tables & Graphs': { category: 'di', emoji: '📈' },
};

export default function AptitudeContainer() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [quizMode, setQuizMode] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { toggleAptitudeTopic, isAptitudeTopicCompleted, isReasoningTopicCompleted } = useProgress();
    
    const isTopicDone = (topicId: string) => {
        return isAptitudeTopicCompleted(topicId) || isReasoningTopicCompleted(topicId);
    };

    // PERFORMANCE: Lazy load the question bank
    const [allQuestions, setAllQuestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // PERFORMANCE: Dynamic import to keep main bundle small
        import('@/data/questions.json').then((res) => {
            setAllQuestions(res.default);
            setIsLoading(false);
        }).catch(err => {
            console.error("Failed to load question bank:", err);
            setIsLoading(false);
        });
    }, []);

    const processedData = useMemo(() => {
        if (allQuestions.length === 0) return {};
        const catMap: Record<string, Record<string, Question[]>> = {};
        allQuestions.forEach((q: any) => {
            const mappedName = TOPIC_MAPPING[q.topic] || q.topic;
            const cat = TOPIC_CONFIG[mappedName]?.category || 'quantitative';
            if (!catMap[cat]) catMap[cat] = {};
            if (!catMap[cat][mappedName]) catMap[cat][mappedName] = [];
            catMap[cat][mappedName].push({
                q: q.question, options: q.options, answer: q.answer,
                explanation: q.explanation, companies: q.companies || []
            });
        });

        const final: Record<string, Topic[]> = {};
        Object.keys(catMap).forEach(cat => {
            final[cat] = Object.entries(catMap[cat]).map(([title, questions]) => ({
                id: title.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                title, emoji: TOPIC_CONFIG[title]?.emoji || '📝', questions
            }));
        });
        return final;
    }, [allQuestions]);

    const handleAnswer = (opt: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(opt);
        setShowExplanation(true);
        if (opt === selectedTopic!.questions[currentQ].answer) setScore(s => s + 1);
    };

    const nextQuestion = () => {
        if (currentQ + 1 < selectedTopic!.questions.length) {
            setCurrentQ(c => c + 1); setSelectedAnswer(null); setShowExplanation(false);
        } else {
            toggleAptitudeTopic(selectedTopic!.id);
            setQuizMode(false); setCurrentQ(0); setSelectedAnswer(null); setShowExplanation(false); setScore(0);
        }
    };

    const goBack = () => {
        if (quizMode) { setQuizMode(false); setCurrentQ(0); setSelectedAnswer(null); setShowExplanation(false); setScore(0); }
        else if (selectedTopic) setSelectedTopic(null);
        else setSelectedCategory(null);
    };

    const topics = useMemo(() => {
        const rawTopics = processedData[selectedCategory || ''] || [];
        if (!searchTerm) return rawTopics;
        return rawTopics.filter(t => 
            t.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [processedData, selectedCategory, searchTerm]);

    if (isLoading) {
        return (
            <div className="min-h-[80vh] px-4 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <Skeleton className="h-8 w-48 mx-auto mb-6 rounded-full" />
                    <Skeleton className="h-16 w-96 mx-auto mb-4" />
                    <Skeleton className="h-4 w-64 mx-auto" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-48 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (!selectedCategory) {
        return (
            <div className="min-h-[80vh] px-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Aptitude Hub</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                        Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Aptitude</span>
                    </h1>
                    <p className="text-zinc-500 max-w-xl mx-auto italic">Optimized delivery for 1,000+ company-mapped questions.</p>
                </motion.div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {CATEGORIES.map((cat, i) => {
                        const topics = processedData[cat.id] || [];
                        const done = topics.filter(t => isTopicDone(t.id)).length;
                        return (
                            <motion.button key={cat.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`group relative p-8 bg-gradient-to-br ${cat.gradient} border ${cat.border} rounded-2xl text-left hover:scale-[1.02] transition-all`}>
                                <cat.icon className={`w-10 h-10 text-${cat.color}-400 mb-4`} />
                                <h3 className="text-xl font-bold text-white mb-2">{cat.label}</h3>
                                <p className="text-sm text-zinc-400 mb-4">{topics.length} topics</p>
                                <div className="flex items-center justify-between">
                                    <div className="w-full bg-white/10 rounded-full h-1.5 mr-4">
                                        <div className={`h-1.5 rounded-full bg-${cat.color}-400 transition-all`} style={{ width: `${topics.length > 0 ? (done / topics.length) * 100 : 0}%` }} />
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white" />
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (!selectedTopic) {
        return (
            <div className="min-h-[80vh] px-4">
                <button onClick={goBack} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={18} /> Back
                </button>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h2 className="text-3xl font-black text-white">{CATEGORIES.find(c => c.id === selectedCategory)?.label}</h2>
                    <div className="relative w-full md:w-64 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topics.map((topic, i) => (
                        <motion.button key={topic.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            onClick={() => setSelectedTopic(topic)}
                            className="group p-6 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-all relative">
                            {isTopicDone(topic.id) && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-400" />}
                            <span className="text-2xl mb-3 block">{topic.emoji}</span>
                            <h3 className="text-lg font-bold text-white mb-1">{topic.title}</h3>
                            <p className="text-xs text-zinc-500">{topic.questions.length} questions</p>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    if (quizMode) {
        const question = selectedTopic.questions[currentQ];
        return (
            <div className="min-h-[80vh] max-w-3xl mx-auto px-4">
                <button onClick={goBack} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8"><ArrowLeft size={18} /> Back</button>
                <div className="p-8 bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden">
                    {question.companies.length > 0 && <div className="absolute top-4 right-4 opacity-10 select-none text-[40px] font-black text-white">{question.companies[0]}</div>}
                    <div className="relative z-10">
                        <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em] mb-3">Asked by: {question.companies.join(', ')}</p>
                        <p className="text-xl font-bold text-white mb-6 leading-relaxed">{question.q}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {question.options.map(opt => {
                                let cls = 'p-4 rounded-xl border text-left font-medium transition-all ';
                                if (!selectedAnswer) cls += 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/40 text-zinc-300';
                                else if (opt === question.answer) cls += 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
                                else if (opt === selectedAnswer) cls += 'bg-red-500/20 border-red-500/40 text-red-300';
                                else cls += 'bg-white/5 border-white/10 text-zinc-600';
                                return <button key={opt} onClick={() => handleAnswer(opt)} className={cls}>{opt}</button>;
                            })}
                        </div>
                    </div>
                </div>
                <AnimatePresence>{showExplanation && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl mt-6">
                    <p className="text-sm text-zinc-300">{question.explanation}</p>
                </motion.div>}</AnimatePresence>
                {selectedAnswer && <button onClick={nextQuestion} className="w-full mt-6 py-4 bg-primary text-white font-bold rounded-xl">{currentQ + 1 < selectedTopic.questions.length ? 'Next' : 'Complete'}</button>}
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] max-w-4xl mx-auto px-4">
            <button onClick={goBack} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8"><ArrowLeft size={18} /> Back</button>
            <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl">{selectedTopic.emoji}</span>
                <h2 className="text-3xl font-black text-white">{selectedTopic.title}</h2>
            </div>
            <button onClick={() => setQuizMode(true)} className="w-full py-5 bg-gradient-to-r from-primary to-purple-600 text-white font-black text-lg rounded-2xl">Start Practice ({selectedTopic.questions.length} Questions)</button>
        </div>
    );
}
