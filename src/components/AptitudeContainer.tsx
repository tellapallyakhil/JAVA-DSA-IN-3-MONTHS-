"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Calculator, MessageSquare, Puzzle, ChevronRight, CheckCircle2, BookOpen, Lightbulb, ArrowLeft, Sparkles, Building2 } from 'lucide-react';

// ─── DATA ────────────────────────────────────────────────────────────────────
const CATEGORIES = [
    { id: 'quantitative', label: 'Quantitative Aptitude', icon: Calculator, color: 'emerald', gradient: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/20' },
    { id: 'logical', label: 'Logical Reasoning', icon: Puzzle, color: 'blue', gradient: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/20' },
    { id: 'verbal', label: 'Verbal Ability', icon: MessageSquare, color: 'purple', gradient: 'from-purple-500/20 to-pink-500/10', border: 'border-purple-500/20' },
];

interface Question { q: string; options: string[]; answer: string; explanation: string; companies: string[]; }
interface Topic { id: string; title: string; emoji: string; formulas: string[]; tricks: string[]; questions: Question[]; }

const TOPICS: Record<string, Topic[]> = {
    quantitative: [
        { id: 'numbers', title: 'Number Systems', emoji: '🔢', formulas: ['Sum of first n naturals = n(n+1)/2', 'Sum of squares = n(n+1)(2n+1)/6', 'Divisibility by 3: sum of digits divisible by 3', 'Divisibility by 11: alternating sum of digits = 0 or multiple of 11'], tricks: ['Unit digit of powers follows a cycle of 4', 'To check prime: test divisibility up to √n', 'Even × Any = Even; Odd × Odd = Odd'], questions: [
            { q: 'What is the unit digit of 7^95?', options: ['1', '3', '7', '9'], answer: '3', explanation: 'Cycle: 7,9,3,1. 95 mod 4 = 3, so unit digit = cycle[3] = 3.', companies: ['TCS', 'Infosys', 'Wipro'] },
            { q: 'HCF of 36 and 48 is?', options: ['6', '12', '18', '24'], answer: '12', explanation: '36=2²×3², 48=2⁴×3. HCF=2²×3=12', companies: ['TCS', 'Cognizant'] },
            { q: 'What is 15% of 240?', options: ['32', '36', '40', '34'], answer: '36', explanation: '15% of 240 = (15/100)×240 = 36', companies: ['Accenture', 'Wipro', 'Capgemini'] },
        ] },
        { id: 'percentages', title: 'Percentages', emoji: '📊', formulas: ['x% of y = y% of x', 'Successive % change: a + b + ab/100', 'If price ↑ by R%, to restore: (R/(100+R))×100% decrease', 'Population formula: P(1 + R/100)^n'], tricks: ['To find 15%: find 10% + 5% (half of 10%)', 'Fraction shortcuts: 1/8=12.5%, 1/6=16.67%', '25%=¼, 33.33%=⅓, 75%=¾'], questions: [
            { q: 'A number increased by 20% then decreased by 20%. Net change?', options: ['-4%', '0%', '-2%', '+4%'], answer: '-4%', explanation: 'Net = 20+(-20)+(20×-20)/100 = -4%', companies: ['TCS', 'Infosys', 'Cognizant', 'HCL'] },
            { q: 'If A is 25% more than B, B is what % less than A?', options: ['20%', '25%', '30%', '15%'], answer: '20%', explanation: 'B less than A by (25/125)×100 = 20%', companies: ['Wipro', 'Accenture', 'TCS'] },
        ] },
        { id: 'profit_loss', title: 'Profit & Loss', emoji: '💰', formulas: ['Profit% = (Profit/CP)×100', 'SP = CP × (1 + P/100)', 'If marked price M, discount D%: SP = M(1-D/100)', 'Two items at same SP, x% profit & x% loss → Net loss = x²/100 %'], tricks: ['If profit = 1/n of CP, then profit% = (100/n)%', 'Dishonest dealer: gain = ((1000-x)/x)×100%'], questions: [
            { q: 'A buys for ₹500, sells at 20% profit. SP = ?', options: ['₹550', '₹600', '₹650', '₹700'], answer: '₹600', explanation: 'SP = 500 × 1.20 = ₹600', companies: ['TCS', 'Infosys', 'Capgemini'] },
            { q: 'Selling at ₹450 gives 10% loss. CP = ?', options: ['₹500', '₹495', '₹510', '₹480'], answer: '₹500', explanation: 'CP = 450/0.90 = ₹500', companies: ['Wipro', 'Cognizant', 'Accenture'] },
        ] },
        { id: 'time_work', title: 'Time & Work', emoji: '⏱️', formulas: ['If A does work in x days, 1 day work = 1/x', 'A+B together: 1/x + 1/y days', 'If A is n times efficient as B, time ratio = 1:n', 'Pipe & Cistern: net = fill - empty'], tricks: ['LCM method: Take LCM of days as total work units', 'Man-days concept: M₁D₁ = M₂D₂'], questions: [
            { q: 'A does work in 10 days, B in 15 days. Together = ?', options: ['5 days', '6 days', '7 days', '8 days'], answer: '6 days', explanation: '1/10 + 1/15 = 5/30 = 1/6. Together = 6 days.', companies: ['TCS', 'Infosys', 'HCL', 'Wipro'] },
        ] },
        { id: 'time_distance', title: 'Speed, Time & Distance', emoji: '🚗', formulas: ['Speed = Distance / Time', 'Average speed (same distance) = 2ab/(a+b)', 'Relative speed (opposite) = a+b', 'Train crossing pole: Time = Length/Speed'], tricks: ['km/hr to m/s: ×5/18', 'm/s to km/hr: ×18/5'], questions: [
            { q: 'A train 150m long passes a pole in 15 sec. Speed in km/hr?', options: ['36', '42', '48', '54'], answer: '36', explanation: 'Speed=150/15=10 m/s = 10×18/5 = 36 km/hr', companies: ['TCS', 'Cognizant', 'Infosys', 'Capgemini'] },
        ] },
        { id: 'averages', title: 'Averages & Mixtures', emoji: '📐', formulas: ['Average = Sum / Count', 'Weighted avg = Σ(wᵢxᵢ) / Σwᵢ', 'Alligation: (Cheaper qty)/(Dearer qty) = (d-m)/(m-c)'], tricks: ['If avg of n numbers is A, sum = n×A', 'Removing/adding: adjust sum accordingly'], questions: [
            { q: 'Average of 5 numbers is 20. One removed, avg becomes 18. Removed number?', options: ['24', '26', '28', '30'], answer: '28', explanation: 'Sum=100. New sum=72. Removed=100-72=28', companies: ['Accenture', 'TCS', 'Wipro'] },
        ] },
    ],
    logical: [
        { id: 'syllogisms', title: 'Syllogisms', emoji: '🧠', formulas: ['All A are B + All B are C → All A are C', 'Some A are B → Some B are A', 'No A are B → No B are A', 'All A are B + No B are C → No A are C'], tricks: ['Use Venn diagrams for every problem', '"Some" means "at least one" — could be all'], questions: [
            { q: 'All cats are dogs. All dogs are animals. Conclusion?', options: ['All cats are animals', 'All animals are cats', 'Some dogs are cats', 'None'], answer: 'All cats are animals', explanation: 'All A→B, All B→C ⟹ All A→C.', companies: ['Infosys', 'TCS', 'Wipro', 'Cognizant'] },
        ] },
        { id: 'blood_relations', title: 'Blood Relations', emoji: '👨‍👩‍👧‍👦', formulas: ["Father's/Mother's son = Brother", "Father's/Mother's daughter = Sister", "Father's brother = Uncle", "Mother's brother = Maternal Uncle"], tricks: ['Draw family tree top-down', 'Use + for male, - for female', 'Count generations carefully'], questions: [
            { q: "A is B's sister. B is C's mother. D is C's father. How is A related to D?", options: ['Sister', 'Sister-in-law', 'Mother', 'Wife'], answer: 'Sister-in-law', explanation: "A is sister of B. B is wife of D. So A is D's sister-in-law.", companies: ['TCS', 'Accenture', 'Capgemini'] },
        ] },
        { id: 'coding_decoding', title: 'Coding & Decoding', emoji: '🔐', formulas: ['Letter shift: A+1=B, A+2=C...', 'Reverse alphabet: A=Z, B=Y, C=X...', 'Position value: A=1, B=2... Z=26'], tricks: ['Check if pattern is +1, +2, -1, reverse', 'Separate letter and number patterns'], questions: [
            { q: 'If CAT = 24, DOG = ?', options: ['26', '27', '28', '30'], answer: '26', explanation: 'C=3,A=1,T=20. Sum=24. D=4,O=15,G=7. Sum=26.', companies: ['Infosys', 'Wipro', 'HCL'] },
        ] },
        { id: 'series', title: 'Number & Letter Series', emoji: '🔢', formulas: ['Arithmetic: a, a+d, a+2d...', 'Geometric: a, ar, ar²...', 'Fibonacci-like: each = sum of previous two'], tricks: ['Always compute differences first', 'Look for alternating patterns'], questions: [
            { q: '2, 6, 12, 20, 30, ?', options: ['40', '42', '44', '46'], answer: '42', explanation: 'Differences: 4,6,8,10,12. Next=30+12=42. Pattern: n(n+1)', companies: ['TCS', 'Cognizant', 'Infosys', 'Accenture'] },
        ] },
        { id: 'seating', title: 'Seating Arrangement', emoji: '💺', formulas: ['Linear: n! arrangements', 'Circular: (n-1)! arrangements'], tricks: ['Always draw the diagram first', 'Fix one person and arrange others relative'], questions: [
            { q: '5 persons A-E sit in a row. A is not at ends. B is left of A. How many ways?', options: ['24', '36', '48', '60'], answer: '36', explanation: 'A has 3 middle positions. B left of A. Others in remaining spots.', companies: ['Infosys', 'TCS', 'Wipro'] },
        ] },
    ],
    verbal: [
        { id: 'synonyms', title: 'Synonyms & Antonyms', emoji: '📖', formulas: ['Synonym = same meaning', 'Antonym = opposite meaning'], tricks: ['Break word into root + prefix + suffix', '"bene"=good, "mal"=bad'], questions: [
            { q: 'Synonym of "Benevolent"?', options: ['Cruel', 'Kind', 'Angry', 'Lazy'], answer: 'Kind', explanation: 'Bene=good, volent=wishing. Benevolent=kind.', companies: ['TCS', 'Wipro', 'Capgemini'] },
            { q: 'Antonym of "Ephemeral"?', options: ['Permanent', 'Temporary', 'Brief', 'Short'], answer: 'Permanent', explanation: 'Ephemeral=short-lived. Opposite=permanent.', companies: ['Infosys', 'Cognizant'] },
        ] },
        { id: 'reading_comp', title: 'Reading Comprehension', emoji: '📰', formulas: ['Main idea = what passage is mostly about', 'Inference = concluded but not stated directly', 'Tone = author attitude'], tricks: ['Read questions first, then the passage', 'Eliminate obviously wrong options'], questions: [
            { q: 'What should you read first in RC?', options: ['The passage', 'The questions', 'The title', 'The options'], answer: 'The questions', explanation: 'Reading questions first helps focus on relevant parts.', companies: ['Accenture', 'Cognizant', 'TCS', 'Infosys'] },
        ] },
        { id: 'sentence_correction', title: 'Sentence Correction', emoji: '✏️', formulas: ['Subject-Verb agreement: Singular→singular verb', 'Parallelism: list items same structure', 'Modifiers: next to what they modify'], tricks: ['Read aloud — errors "sound wrong"', '"Neither...nor" — verb agrees with nearest subject'], questions: [
            { q: '"Each of the boys have completed their work." Error?', options: ['have→has', 'their→his', 'Both A and B', 'No error'], answer: 'Both A and B', explanation: '"Each" is singular: "has"+"his".', companies: ['TCS', 'Wipro', 'HCL', 'Capgemini'] },
        ] },
        { id: 'para_jumbles', title: 'Para Jumbles', emoji: '🔀', formulas: ['Opening: introduces topic, no backward reference', 'Closing: summarizes or concludes', 'Link pairs: pronouns connect sentences'], tricks: ['Opening has no "this/that/however"', 'Look for noun→pronoun pairs'], questions: [
            { q: 'Which word usually does NOT start an opening sentence?', options: ['The', 'However', 'In', 'A'], answer: 'However', explanation: '"However" implies contrast with previous idea.', companies: ['Infosys', 'Accenture', 'Cognizant'] },
        ] },
    ],
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function AptitudeContainer() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [quizMode, setQuizMode] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState(0);
    const [showExplanation, setShowExplanation] = useState(false);
    const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

    const handleAnswer = (opt: string) => {
        if (selectedAnswer) return;
        setSelectedAnswer(opt);
        setShowExplanation(true);
        if (opt === selectedTopic!.questions[currentQ].answer) setScore(s => s + 1);
    };

    const nextQuestion = () => {
        if (currentQ + 1 < selectedTopic!.questions.length) {
            setCurrentQ(c => c + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            setCompletedTopics(prev => new Set(prev).add(selectedTopic!.id));
            setQuizMode(false);
            setCurrentQ(0);
            setSelectedAnswer(null);
            setShowExplanation(false);
            setScore(0);
        }
    };

    const goBack = () => {
        if (quizMode) { setQuizMode(false); setCurrentQ(0); setSelectedAnswer(null); setShowExplanation(false); setScore(0); }
        else if (selectedTopic) setSelectedTopic(null);
        else setSelectedCategory(null);
    };

    // ── Category Selection ──
    if (!selectedCategory) {
        return (
            <div className="min-h-[80vh]">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Aptitude Hub</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">
                        Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">Aptitude</span>
                    </h1>
                    <p className="text-zinc-500 max-w-xl mx-auto">Topic-wise formulas, tricks, and interactive practice for placement aptitude rounds.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {CATEGORIES.map((cat, i) => {
                        const topics = TOPICS[cat.id] || [];
                        const done = topics.filter(t => completedTopics.has(t.id)).length;
                        return (
                            <motion.button key={cat.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`group relative p-8 bg-gradient-to-br ${cat.gradient} border ${cat.border} rounded-2xl text-left hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl`}>
                                <cat.icon className={`w-10 h-10 text-${cat.color}-400 mb-4`} />
                                <h3 className="text-xl font-bold text-white mb-2">{cat.label}</h3>
                                <p className="text-sm text-zinc-400 mb-4">{topics.length} topics available</p>
                                <div className="flex items-center justify-between">
                                    <div className="w-full bg-white/10 rounded-full h-1.5 mr-4">
                                        <div className={`h-1.5 rounded-full bg-${cat.color}-400 transition-all`} style={{ width: `${topics.length > 0 ? (done / topics.length) * 100 : 0}%` }} />
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        );
    }

    const category = CATEGORIES.find(c => c.id === selectedCategory)!;
    const topics = TOPICS[selectedCategory] || [];

    // ── Topic List ──
    if (!selectedTopic) {
        return (
            <div className="min-h-[80vh]">
                <button onClick={goBack} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={18} /> Back to Categories
                </button>
                <div className="flex items-center gap-4 mb-8">
                    <category.icon className={`w-8 h-8 text-${category.color}-400`} />
                    <h2 className="text-3xl font-black text-white">{category.label}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topics.map((topic, i) => (
                        <motion.button key={topic.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                            onClick={() => setSelectedTopic(topic)}
                            className={`group p-6 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 hover:border-${category.color}-500/30 transition-all relative`}>
                            {completedTopics.has(topic.id) && <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-emerald-400" />}
                            <span className="text-2xl mb-3 block">{topic.emoji}</span>
                            <h3 className="text-lg font-bold text-white mb-1">{topic.title}</h3>
                            <p className="text-xs text-zinc-500">{topic.formulas.length} formulas · {topic.questions.length} questions</p>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    // ── Quiz Mode ──
    if (quizMode && selectedTopic.questions.length > 0) {
        const question = selectedTopic.questions[currentQ];
        return (
            <div className="min-h-[80vh] max-w-3xl mx-auto">
                <button onClick={goBack} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={18} /> Back to {selectedTopic.title}
                </button>
                <div className="flex items-center justify-between mb-6">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Question {currentQ + 1} / {selectedTopic.questions.length}</span>
                    <span className="text-xs font-bold text-emerald-400">Score: {score}</span>
                </div>
                <div className="p-8 bg-white/5 border border-white/10 rounded-2xl mb-6">
                    <p className="text-xl font-bold text-white mb-4">{question.q}</p>
                    {question.companies.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                            {question.companies.map(c => (
                                <span key={c} className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded-full">{c}</span>
                            ))}
                        </div>
                    )}
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
                <AnimatePresence>
                    {showExplanation && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="w-4 h-4 text-blue-400" />
                                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Explanation</span>
                            </div>
                            <p className="text-sm text-zinc-300">{question.explanation}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
                {selectedAnswer && (
                    <button onClick={nextQuestion} className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all">
                        {currentQ + 1 < selectedTopic.questions.length ? 'Next Question →' : '✅ Complete Topic'}
                    </button>
                )}
            </div>
        );
    }

    // ── Topic Detail (Formulas + Tricks) ──
    return (
        <div className="min-h-[80vh] max-w-4xl mx-auto">
            <button onClick={goBack} className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
                <ArrowLeft size={18} /> Back to {category.label}
            </button>
            <div className="flex items-center gap-4 mb-8">
                <span className="text-4xl">{selectedTopic.emoji}</span>
                <div>
                    <h2 className="text-3xl font-black text-white">{selectedTopic.title}</h2>
                    <p className="text-sm text-zinc-500">{selectedTopic.formulas.length} formulas · {selectedTopic.tricks.length} tricks · {selectedTopic.questions.length} practice questions</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Key Formulas</h3>
                    </div>
                    <ul className="space-y-3">
                        {selectedTopic.formulas.map((f, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="mt-1 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                                <span className="text-sm text-zinc-300 font-mono">{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="p-6 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        <h3 className="text-sm font-bold text-amber-400 uppercase tracking-widest">Quick Tricks</h3>
                    </div>
                    <ul className="space-y-3">
                        {selectedTopic.tricks.map((t, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span className="mt-1 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">⚡</span>
                                <span className="text-sm text-zinc-300">{t}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {selectedTopic.questions.length > 0 && (
                <button onClick={() => setQuizMode(true)} className="w-full py-5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-black text-lg rounded-2xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-3">
                    <Brain className="w-6 h-6" /> Start Practice ({selectedTopic.questions.length} Questions)
                </button>
            )}
        </div>
    );
}
