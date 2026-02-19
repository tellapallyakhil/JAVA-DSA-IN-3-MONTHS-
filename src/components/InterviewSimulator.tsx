'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Mic, MicOff, Video, VideoOff, Users, AlertCircle, PlayCircle, StopCircle,
    RefreshCw, Loader2, Send, MessageSquare, X, ChevronRight, Sparkles,
    ThumbsUp, Clock, Target, Check, ArrowRight, Volume2, VolumeX,
    Star, Award, TrendingUp, Building2, Zap, Timer, ExternalLink, Home,
    ChevronDown, BarChart3, BookOpen
} from 'lucide-react';

type InterviewMode = 'setup' | 'interview' | 'review';
type QuestionType = 'dsa' | 'system-design' | 'behavioral' | 'hr';
type DifficultyLevel = 'easy' | 'medium' | 'hard';
type CompanyFocus = 'general' | 'faang' | 'startup' | 'product';

interface Message {
    id: string;
    role: 'interviewer' | 'candidate' | 'feedback';
    content: string;
    timestamp: Date;
    score?: number;
}

interface SessionStats {
    questionsAnswered: number;
    startTime: Date;
    totalTime: number;
    averageScore: number;
    scores: number[];
}

interface InterviewSimulatorProps {
    fullPage?: boolean;
}

const TOPIC_OPTIONS: { value: QuestionType; label: string; icon: string; description: string }[] = [
    { value: 'dsa', label: 'DSA & Algorithms', icon: '🧮', description: 'Arrays, Trees, DP, Graphs' },
    { value: 'system-design', label: 'System Design', icon: '🏗️', description: 'Scalability, APIs, Databases' },
    { value: 'behavioral', label: 'Behavioral', icon: '🗣️', description: 'STAR method, Teamwork' },
    { value: 'hr', label: 'HR Round', icon: '👥', description: 'Salary, Strengths, Goals' },
];

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string; color: string }[] = [
    { value: 'easy', label: 'Easy', color: 'text-green-400 bg-green-500/10 border-green-500/30' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
    { value: 'hard', label: 'Hard', color: 'text-red-400 bg-red-500/10 border-red-500/30' },
];

const COMPANY_OPTIONS: { value: CompanyFocus; label: string; icon: React.ReactNode }[] = [
    { value: 'general', label: 'General', icon: <Building2 size={14} /> },
    { value: 'faang', label: 'FAANG Style', icon: <Star size={14} /> },
    { value: 'startup', label: 'Startup', icon: <Zap size={14} /> },
    { value: 'product', label: 'Product Based', icon: <Target size={14} /> },
];

export default function InterviewSimulator({ fullPage = false }: InterviewSimulatorProps) {
    const [mode, setMode] = useState<InterviewMode>('setup');
    const [selectedTopic, setSelectedTopic] = useState<QuestionType>('dsa');
    const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
    const [companyFocus, setCompanyFocus] = useState<CompanyFocus>('general');
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voiceEnabled, setVoiceEnabled] = useState(true);
    const [stats, setStats] = useState<SessionStats | null>(null);
    const [currentHints, setCurrentHints] = useState<string[]>([]);
    const [showHints, setShowHints] = useState(false);
    const [questionTimer, setQuestionTimer] = useState(0);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [askedQuestions, setAskedQuestions] = useState<Set<string>>(new Set());

    const videoRef = useRef<HTMLVideoElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const recognitionRef = useRef<any>(null);
    const synthRef = useRef<SpeechSynthesis | null>(null);

    // Initialize speech synthesis
    useEffect(() => {
        if (typeof window !== 'undefined') {
            synthRef.current = window.speechSynthesis;
        }
    }, []);

    // Question timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerActive && mode === 'interview') {
            interval = setInterval(() => setQuestionTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, mode]);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Speak text using Web Speech API
    const speakText = useCallback((text: string) => {
        if (!voiceEnabled || !synthRef.current) return;

        synthRef.current.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        synthRef.current.speak(utterance);
    }, [voiceEnabled]);

    // Stop speaking
    const stopSpeaking = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsSpeaking(false);
        }
    };

    // Voice input using Web Speech API
    const toggleVoiceInput = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in your browser. Try Chrome.');
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                setUserInput(prev => prev + ' ' + finalTranscript.trim());
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.start();
    };

    // Camera setup
    const toggleCamera = async () => {
        if (isCameraOn) {
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
            setIsCameraOn(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsCameraOn(true);
            } catch (err) {
                console.error('Camera access denied:', err);
            }
        }
    };

    // Generate interview question via API
    const generateQuestion = useCallback(async (isFollowUp = false, context = '') => {
        setIsLoading(true);
        setShowHints(false);
        setQuestionTimer(0);
        setIsTimerActive(true);

        try {
            const typeMap: Record<QuestionType, string> = {
                'dsa': 'technical',
                'system-design': 'technical',
                'behavioral': 'behavioral',
                'hr': 'behavioral'
            };

            const topicMap: Record<QuestionType, string> = {
                'dsa': 'Data Structures and Algorithms (Arrays, Trees, Graphs, DP, Recursion)',
                'system-design': 'System Design (Scalability, Distributed Systems, Database Design, API Design)',
                'behavioral': 'Behavioral Interview (Leadership, Conflict Resolution, Teamwork)',
                'hr': 'HR Round (Career Goals, Salary Expectations, Strengths and Weaknesses)'
            };

            // Get list of previously asked questions to avoid repetition
            const previousQuestions = Array.from(askedQuestions).slice(-5); // Last 5 questions

            const body: Record<string, unknown> = {
                topic: topicMap[selectedTopic],
                type: typeMap[selectedTopic],
                difficulty: difficulty,
                companyStyle: companyFocus,
                avoidQuestions: previousQuestions // Tell AI to avoid these
            };

            if (isFollowUp && context) {
                body.followUp = true;
                body.previousAnswer = context;
            }

            const res = await fetch('/api/interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                throw new Error('API Error');
            }

            const data = await res.json();

            let questionText = data.question || 'Tell me about a challenging project you worked on.';

            // Track this question to avoid repetition
            setAskedQuestions(prev => new Set([...prev, questionText]));

            const newMessage: Message = {
                id: `q-${Date.now()}`,
                role: 'interviewer',
                content: questionText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, newMessage]);
            setCurrentHints(data.hints || ['Think through your approach', 'Consider edge cases', 'Explain your reasoning']);

            // Speak the question if voice is enabled
            speakText(questionText);

        } catch (error) {
            console.error('Failed to generate question:', error);
            // Fallback questions based on difficulty
            // Fallback questions based on difficulty
            const fallbackQuestions: Record<QuestionType, Record<DifficultyLevel, string[]>> = {
                'dsa': {
                    'easy': [
                        'What is the difference between an array and a linked list?',
                        'Explain how a stack works and its LIFO principle.',
                        'What is time complexity and why does it matter?',
                        'Explain the concept of recursion with an example.',
                        'How do you check if a string is a palindrome?',
                        'What is the difference between specific and generic programming?',
                        'How does Binary Search work?',
                        'What is a hash table and how does it handle collisions?',
                        'Explain the difference between undefined and null in JavaScript.',
                        'How do you reverse a string in place?'
                    ],
                    'medium': [
                        'How would you implement an LRU (Least Recently Used) Cache?',
                        'Explain quicksort and its worst-case time complexity.',
                        'How do you detect a cycle in a linked list?',
                        'Find the longest substring without repeating characters.',
                        'Explain the difference between BFS and DFS graph traversals.',
                        'How would you merge two sorted linked lists?',
                        'Find the Kth largest element in an array.',
                        'Given a binary tree, check if it is a valid Binary Search Tree (BST).',
                        'Explain Dynamic Programming with the Coin Change problem.',
                        'Group anagrams together from a list of strings.'
                    ],
                    'hard': [
                        'Design an algorithm to find the median of two sorted arrays in O(log(min(m,n))).',
                        'Implement a persistent data structure.',
                        'Solve the N-Queens problem optimally.',
                        'Trapping Rain Water problem: Calculate how much water can be trapped after raining.',
                        'Serialize and Deserialize a Binary Tree.',
                        'Find the maximum path sum in a binary tree.',
                        'Word Ladder II: Find all shortest transformation sequences.',
                        'Merge k Sorted Lists efficiently.',
                        'Implement a regular expression matching parser with support for "." and "*".',
                        'Find the largest rectangle in a histogram.'
                    ]
                },
                'system-design': {
                    'easy': [
                        'What is a load balancer and why do we need it?',
                        'Explain the difference between SQL and NoSQL databases.',
                        'What is caching? Where can it be applied?',
                        'What is horizontal vs vertical scaling?',
                        'Explain the concept of Database Sharding.',
                        'What is a CDN (Content Delivery Network)?',
                        'What is CAP theorem?',
                        'How does HTTPS work?',
                        'What is the difference between TCP and UDP?',
                        'Explain the concept of microservices.'
                    ],
                    'medium': [
                        'Design a URL shortener like bit.ly.',
                        'How would you design a chat application like WhatsApp?',
                        'Design a rate limiter to prevent abuse.',
                        'Design a notification system.',
                        'How would you design an autocomplete feature for a search engine?',
                        'Design a parking lot system (Low Level Design).',
                        'Design a key-value store like Redis.',
                        'How to handle the Thundering Herd simple problem in caching?',
                        'Design a leaderboard for a gaming platform.',
                        'How would you design an image upload service like Imgur?'
                    ],
                    'hard': [
                        'Design Twitter\'s real-time feed system.',
                        'Design a distributed file storage system like Google Drive / S3.',
                        'Design a globally distributed database that needs high availability.',
                        'Design a web crawler effectively.',
                        'Design a video streaming service like Netflix.',
                        'Design a payment system that ensures transactional integrity.',
                        'Design a distributed job scheduler.',
                        'Design a real-time collaborative code editor like Google Docs/VS Code Live.',
                        'Design a metric logging and monitoring system.',
                        'How would you design a system to handle millions of WebSocket connections?'
                    ]
                },
                'behavioral': {
                    'easy': [
                        'Tell me about yourself.',
                        'Why are you interested in this role?',
                        'What are your greatest strengths?',
                        'What is your biggest weakness?',
                        'Describe your ideal work environment.',
                        'What motivates you?',
                        'Do you prefer working alone or in a team?',
                        'How do you stay updated with new technologies?',
                        'What are your hobbies?',
                        'What was your favorite project?'
                    ],
                    'medium': [
                        'Tell me about a time you had a conflict with a teammate and how you resolved it.',
                        'Describe a challenging project you completed and the obstacles you overcame.',
                        'How do you handle tight deadlines and pressure?',
                        'Tell me about a time you made a mistake. How did you handle it?',
                        'Describe a time you showed leadership.',
                        'How do you explain technical concepts to non-technical stakeholders?',
                        'Tell me about a time you disagreed with your manager.',
                        'Describe a situation where you had to adapt to a significant change.',
                        'Give an example of a goal you didn\'t meet and how you handled it.',
                        'Tell me about a time you went above and beyond for a project.'
                    ],
                    'hard': [
                        'Tell me about a time you failed and what you learned from it.',
                        'Describe a situation where you had to influence others without authority.',
                        'How do you make decisions with incomplete information?',
                        'Tell me about a time you had to deliver bad news.',
                        'Describe a time you had to prioritize between two critical tasks.',
                        'How do you handle constructive criticism?',
                        'Tell me about a time you had to work with a difficult person.',
                        'Describe a situation where you challenged the status quo.',
                        'How do you ensure your team maintains high motivation?',
                        'Tell me about a significant ethical dilemma you faced.'
                    ]
                },
                'hr': {
                    'easy': [
                        'What do you know about our company?',
                        'Where do you see yourself in 5 years?',
                        'What motivates you to come to work every day?',
                        'Why should we hire you?',
                        'What are your salary expectations?',
                        'Are you willing to relocate?',
                        'How soon can you join?',
                        'What is your preferred management style?',
                        'Do you have any questions for us?',
                        'What are top 3 things you look for in a job?'
                    ],
                    'medium': [
                        'Why are you leaving your current role?',
                        'Describe your ideal work culture.',
                        'What would your previous manager say about you?',
                        'How do you handle stress?',
                        'What is your proudest professional achievement?',
                        'How do you handle feedback?',
                        'What makes you uncomfortable in a work environment?',
                        'Describe a time you took initiative.',
                        'How do you organize your day?',
                        'What kind of projects excite you the most?'
                    ],
                    'hard': [
                        'How do you handle disagreements with your manager?',
                        'What would you do if you disagreed with a company policy?',
                        'How do you balance work and personal life during crunch time?',
                        'Tell me about a time you felt underappreciated.',
                        'What would you do if you saw a coworker doing something unethical?',
                        'How do you handle multiple offers?',
                        'What is the biggest risk you have taken in your career?',
                        'How do you define success?',
                        'What would you do in your first 30 days here?',
                        'Describe a time you had to compromise to get the job done.'
                    ]
                }
            };

            const questions = fallbackQuestions[selectedTopic][difficulty];
            // Filter out questions that were already asked
            const availableQuestions = questions.filter(q => !askedQuestions.has(q));
            // If all questions were asked, reset and use all questions
            const questionPool = availableQuestions.length > 0 ? availableQuestions : questions;
            const randomQ = questionPool[Math.floor(Math.random() * questionPool.length)];

            // Track this question
            setAskedQuestions(prev => new Set([...prev, randomQ]));

            setMessages(prev => [...prev, {
                id: `q-${Date.now()}`,
                role: 'interviewer',
                content: randomQ,
                timestamp: new Date()
            }]);
            setCurrentHints(['Structure your answer clearly', 'Provide specific examples', 'Be concise']);
            speakText(randomQ);
        } finally {
            setIsLoading(false);
        }
    }, [selectedTopic, difficulty, companyFocus, speakText, askedQuestions]);

    // Submit user's answer
    const submitAnswer = async () => {
        if (!userInput.trim() || isLoading) return;

        setIsTimerActive(false);
        stopSpeaking();

        const candidateMessage: Message = {
            id: `a-${Date.now()}`,
            role: 'candidate',
            content: userInput.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, candidateMessage]);
        const answerText = userInput.trim();
        setUserInput('');

        // Generate AI feedback
        setIsLoading(true);
        try {
            const res = await fetch('/api/interview/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: messages[messages.length - 1]?.content || '',
                    answer: answerText,
                    topic: selectedTopic,
                    difficulty: difficulty
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Handle greeting responses - don't count as real answers
                if (data.isGreeting) {
                    const greetingMessage: Message = {
                        id: `f-${Date.now()}`,
                        role: 'feedback',
                        content: data.feedback,
                        timestamp: new Date(),
                        score: 0
                    };
                    setMessages(prev => [...prev, greetingMessage]);
                    setIsLoading(false);
                    // Don't generate follow-up for greetings, let user answer the actual question
                    return;
                }

                // Use nullish coalescing to properly handle score of 0
                const score = data.score ?? Math.floor(Math.random() * 3) + 7;

                const feedbackMessage: Message = {
                    id: `f-${Date.now()}`,
                    role: 'feedback',
                    content: data.feedback || 'Good answer! Consider adding more specific examples.',
                    timestamp: new Date(),
                    score: score
                };
                setMessages(prev => [...prev, feedbackMessage]);

                // Update stats - only count if score > 0 (valid answer attempt)
                if (score > 0) {
                    setStats(prev => {
                        if (!prev) return prev;
                        const newScores = [...prev.scores, score];
                        return {
                            ...prev,
                            questionsAnswered: prev.questionsAnswered + 1,
                            scores: newScores,
                            averageScore: newScores.reduce((a, b) => a + b, 0) / newScores.length
                        };
                    });
                }
            }
        } catch (err) {
            // Silent fail for feedback
            setStats(prev => prev ? { ...prev, questionsAnswered: prev.questionsAnswered + 1 } : prev);
        }

        // Small delay then generate follow-up or new question
        setTimeout(() => {
            generateQuestion(true, answerText);
        }, 2000);
    };

    // Start interview session
    const startInterview = () => {
        setMode('interview');
        setMessages([]);
        setAskedQuestions(new Set()); // Reset asked questions for new session
        setStats({
            questionsAnswered: 0,
            startTime: new Date(),
            totalTime: 0,
            averageScore: 0,
            scores: []
        });
        generateQuestion();
    };

    // End session and show review
    const endInterview = () => {
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
        setIsTimerActive(false);
        stopSpeaking();

        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }

        if (stats) {
            setStats({
                ...stats,
                totalTime: Math.round((Date.now() - stats.startTime.getTime()) / 1000)
            });
        }
        setMode('review');
    };

    // Reset to setup
    const resetSession = () => {
        setMode('setup');
        setMessages([]);
        setStats(null);
        setUserInput('');
        setCurrentHints([]);
        setQuestionTimer(0);
    };

    // Format seconds to MM:SS
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Handle Enter key in textarea
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitAnswer();
        }
    };

    // Get score color
    const getScoreColor = (score: number) => {
        if (score >= 8) return 'text-green-400';
        if (score >= 6) return 'text-yellow-400';
        return 'text-red-400';
    };

    // ====================
    // RENDER: SETUP MODE
    // ====================
    if (mode === 'setup') {
        return (
            <div className={`glass-card ${fullPage ? 'p-8 sm:p-12' : 'p-6 sm:p-8'} relative overflow-hidden`}>
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-pink-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-2xl -ml-24 -mb-24 pointer-events-none" />

                <div className="relative z-10">
                    {fullPage && (
                        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6 transition-colors group">
                            <Home size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                            Back to Dashboard
                        </Link>
                    )}

                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-500/15 to-blue-500/10 mb-4 shadow-lg shadow-pink-500/10 border border-white/10">
                            <Users className="w-9 h-9 text-pink-400" />
                        </div>
                        <h2 className={`${fullPage ? 'text-3xl sm:text-4xl' : 'text-2xl'} font-bold mb-2 bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent`}>AI Interview Simulator</h2>
                        <p className="text-muted-foreground max-w-md mx-auto">Practice with AI-powered questions and get real-time feedback on your performance</p>
                    </div>

                    {/* Topic Selection */}
                    <div className="mb-4 sm:mb-6">
                        <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-muted-foreground uppercase tracking-wider">Select Interview Type</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {TOPIC_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setSelectedTopic(option.value)}
                                    className={`p-4 rounded-xl border text-left transition-all ${selectedTopic === option.value
                                        ? 'bg-primary/20 border-primary shadow-[0_0_20px_-5px_rgba(124,58,237,0.4)]'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{option.icon}</span>
                                        <div>
                                            <div className="font-semibold">{option.label}</div>
                                            <div className="text-xs text-muted-foreground">{option.description}</div>
                                        </div>
                                        {selectedTopic === option.value && (
                                            <Check className="ml-auto text-primary" size={20} />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty Selection */}
                    <div className="mb-4 sm:mb-6">
                        <h3 className="text-xs sm:text-sm font-semibold mb-2 sm:mb-3 text-muted-foreground uppercase tracking-wider">Difficulty Level</h3>
                        <div className="flex gap-1.5 sm:gap-3">
                            {DIFFICULTY_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => setDifficulty(option.value)}
                                    className={`flex-1 px-2 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border transition-all font-medium text-xs sm:text-sm ${difficulty === option.value
                                        ? option.color + ' border-current'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Options Toggle */}
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-white py-2 mb-4 transition-colors"
                    >
                        <span>Advanced Options</span>
                        <ChevronDown className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} size={16} />
                    </button>

                    {showAdvanced && (
                        <div className="space-y-4 mb-6 animate-in slide-in-from-top-2">
                            {/* Company Focus */}
                            <div>
                                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Company Style</h3>
                                <div className="flex flex-wrap gap-2">
                                    {COMPANY_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setCompanyFocus(option.value)}
                                            className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${companyFocus === option.value
                                                ? 'bg-primary/20 border-primary text-white'
                                                : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/70'
                                                }`}
                                        >
                                            {option.icon}
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>


                        </div>
                    )}

                    {/* Voice Settings - Highly Visible */}
                    <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                                <Volume2 size={20} />
                            </div>
                            <div>
                                <div className="text-sm font-medium">Voice Interviewer</div>
                                <div className="text-xs text-muted-foreground">AI reads questions aloud (Realistic)</div>
                            </div>
                        </div>
                        <button
                            onClick={() => setVoiceEnabled(!voiceEnabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${voiceEnabled ? 'bg-primary' : 'bg-white/20'}`}
                        >
                            <span className={`${voiceEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                        </button>
                    </div>

                    {/* How it Works */}
                    <div className="bg-gradient-to-br from-yellow-500/10 via-amber-500/5 to-transparent rounded-xl p-4 mb-6 border border-yellow-500/20">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-yellow-500/20">
                                <Sparkles className="text-yellow-400" size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white mb-2">How it works</p>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-2 text-white/70">
                                        <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400">1</div>
                                        <span>AI asks questions</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/70">
                                        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center text-[10px] font-bold text-green-400">2</div>
                                        <span>Type or speak answer</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/70">
                                        <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] font-bold text-purple-400">3</div>
                                        <span>Get AI feedback (1-10)</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/70">
                                        <div className="w-5 h-5 rounded-full bg-pink-500/20 flex items-center justify-center text-[10px] font-bold text-pink-400">4</div>
                                        <span>AI follow-up questions</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={startInterview}
                        className="group w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_-5px_rgba(236,72,153,0.5)] hover:shadow-[0_0_60px_-5px_rgba(236,72,153,0.6)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <PlayCircle size={24} className="group-hover:scale-110 transition-transform" />
                        Start Mock Interview
                        <ArrowRight size={18} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </button>
                </div>

                {!fullPage && (
                    <Link
                        href="/interview"
                        className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors"
                    >
                        <ExternalLink size={14} />
                        Open Full Screen Mode
                    </Link>
                )}
            </div>
        );
    }

    // ====================
    // RENDER: REVIEW MODE
    // ====================
    if (mode === 'review') {
        const totalQuestions = messages.filter(m => m.role === 'interviewer').length;
        const totalAnswers = messages.filter(m => m.role === 'candidate').length;
        const feedbackMessages = messages.filter(m => m.role === 'feedback');

        return (
            <div className={`glass-card ${fullPage ? 'p-8 sm:p-12' : 'p-6 sm:p-8'}`}>
                {fullPage && (
                    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-6 transition-colors">
                        <Home size={16} />
                        Back to Dashboard
                    </Link>
                )}

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                        <Award className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className={`${fullPage ? 'text-3xl' : 'text-2xl'} font-bold mb-2`}>Interview Complete!</h2>
                    <p className="text-muted-foreground">Great practice session. Here's your performance summary.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                        <Target className="w-6 h-6 mx-auto text-blue-400 mb-2" />
                        <div className="text-2xl font-bold">{totalQuestions}</div>
                        <div className="text-xs text-muted-foreground">Questions</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                        <MessageSquare className="w-6 h-6 mx-auto text-green-400 mb-2" />
                        <div className="text-2xl font-bold">{totalAnswers}</div>
                        <div className="text-xs text-muted-foreground">Answers</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                        <Clock className="w-6 h-6 mx-auto text-purple-400 mb-2" />
                        <div className="text-2xl font-bold">{stats ? formatTime(stats.totalTime) : '0:00'}</div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                        <BarChart3 className="w-6 h-6 mx-auto text-yellow-400 mb-2" />
                        <div className={`text-2xl font-bold ${stats && stats.averageScore > 0 ? getScoreColor(stats.averageScore) : 'text-white'}`}>
                            {stats && stats.averageScore > 0 ? stats.averageScore.toFixed(1) : 'N/A'}
                        </div>
                        <div className="text-xs text-muted-foreground">Avg Score</div>
                    </div>
                </div>

                {/* Score Breakdown */}
                {stats && stats.scores.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp size={16} />
                            Score Progression
                        </h3>
                        <div className="flex items-end gap-2 h-20 bg-black/20 rounded-xl p-4 border border-white/5">
                            {stats.scores.map((score, i) => (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-t ${getScoreColor(score)} bg-current`}
                                    style={{ height: `${(score / 10) * 100}%`, opacity: 0.7 }}
                                    title={`Q${i + 1}: ${score}/10`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>Q1</span>
                            <span>Q{stats.scores.length}</span>
                        </div>
                    </div>
                )}

                {/* Conversation Transcript */}
                <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <BookOpen size={16} />
                        Session Transcript
                    </h3>
                    <div className="bg-black/20 rounded-xl p-4 max-h-64 overflow-y-auto space-y-3 border border-white/5">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`text-sm ${msg.role === 'interviewer' ? 'text-blue-300' :
                                msg.role === 'feedback' ? 'text-green-300 opacity-70' :
                                    'text-white/80'
                                }`}>
                                <span className="font-medium">
                                    {msg.role === 'interviewer' ? '🤖 AI: ' : msg.role === 'feedback' ? `✨ Feedback ${msg.score ? `(${msg.score}/10)` : ''}: ` : '👤 You: '}
                                </span>
                                {msg.content}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={resetSession}
                        className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} />
                        New Session
                    </button>
                    <button
                        onClick={startInterview}
                        className="flex-1 bg-primary hover:bg-primary/90 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <ArrowRight size={18} />
                        Practice Again
                    </button>
                </div>
            </div>
        );
    }

    // ====================
    // RENDER: INTERVIEW MODE
    // ====================
    return (
        <div className={`glass-card ${fullPage ? 'p-6 sm:p-8' : 'p-4 sm:p-6'} relative overflow-hidden`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    {fullPage && (
                        <Link href="/" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <Home size={16} />
                        </Link>
                    )}
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2 flex-wrap">
                            <Users className="text-pink-500" size={20} />
                            Mock Interview
                            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-muted-foreground">
                                {TOPIC_OPTIONS.find(t => t.value === selectedTopic)?.label}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_OPTIONS.find(d => d.value === difficulty)?.color}`}>
                                {difficulty}
                            </span>
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Question Timer */}
                    <div className="bg-white/5 text-white/70 px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1.5">
                        <Timer size={12} />
                        {formatTime(questionTimer)}
                    </div>
                    <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-mono animate-pulse flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        LIVE
                    </div>
                    <button
                        onClick={endInterview}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="End Interview"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            <div className={`grid grid-cols-1 ${fullPage ? 'lg:grid-cols-[1fr,380px]' : 'lg:grid-cols-[1fr,320px]'} gap-4`}>
                {/* Chat Area */}
                <div className={`flex flex-col ${fullPage ? 'h-[500px]' : 'h-[400px]'} bg-black/20 rounded-xl border border-white/5 overflow-hidden`}>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && !isLoading && (
                            <div className="text-center text-muted-foreground text-sm py-8">
                                Interview starting...
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'interviewer'
                                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-100'
                                    : msg.role === 'feedback'
                                        ? 'bg-green-500/10 border border-green-500/20 text-green-200'
                                        : 'bg-primary/20 border border-primary/30 text-white'
                                    }`}>
                                    {msg.role === 'interviewer' && (
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] text-blue-400/70 font-medium">🤖 Interviewer</span>
                                            {voiceEnabled && (
                                                <button
                                                    onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.content)}
                                                    className="text-blue-400/50 hover:text-blue-400 transition-colors"
                                                >
                                                    {isSpeaking ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {msg.role === 'feedback' && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] text-green-400/70 font-medium">✨ AI Feedback</span>
                                            {msg.score && (
                                                <span className={`text-xs font-bold ${getScoreColor(msg.score)}`}>
                                                    {msg.score}/10
                                                </span>
                                            )}
                                        </div>
                                    )}
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl px-5 py-4 flex items-center gap-3 border border-blue-500/20">
                                    <div className="relative">
                                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                                        <div className="absolute inset-0 w-5 h-5 rounded-full bg-blue-400/20 animate-ping" />
                                    </div>
                                    <div>
                                        <span className="text-sm text-blue-200 font-medium">AI is thinking...</span>
                                        <div className="flex gap-1 mt-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 border-t border-white/5 bg-black/20">
                        <div className="flex gap-2">
                            <button
                                onClick={toggleVoiceInput}
                                className={`p-3 rounded-xl transition-colors ${isListening
                                    ? 'bg-red-500 text-white animate-pulse'
                                    : 'bg-white/5 hover:bg-white/10 text-white/70'
                                    }`}
                                title={isListening ? 'Stop listening' : 'Voice input'}
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                            <textarea
                                ref={inputRef}
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isListening ? "Listening... speak now" : "Type your answer... (Enter to send)"}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary/50 placeholder:text-white/30"
                                rows={2}
                                disabled={isLoading}
                            />
                            <button
                                onClick={submitAnswer}
                                disabled={!userInput.trim() || isLoading}
                                className="px-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-4">
                    {/* Video Preview */}
                    <div className="aspect-video bg-black/40 rounded-xl overflow-hidden relative border border-white/10">
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover transform scale-x-[-1]"
                        />
                        {!isCameraOn && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                                <VideoOff className="text-white/30 mb-2" size={32} />
                                <span className="text-xs text-white/30">Camera Off</span>
                            </div>
                        )}
                        <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-2">
                            <button
                                onClick={toggleCamera}
                                className={`p-2 rounded-full ${isCameraOn ? 'bg-white/20' : 'bg-red-500/30'} backdrop-blur-sm transition-colors`}
                            >
                                {isCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
                            </button>
                            <button
                                onClick={() => setIsMicOn(!isMicOn)}
                                className={`p-2 rounded-full ${isMicOn ? 'bg-white/20' : 'bg-red-500/30'} backdrop-blur-sm transition-colors`}
                            >
                                {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                            </button>
                            {voiceEnabled && (
                                <button
                                    onClick={() => isSpeaking ? stopSpeaking() : null}
                                    className={`p-2 rounded-full ${isSpeaking ? 'bg-blue-500/30 animate-pulse' : 'bg-white/20'} backdrop-blur-sm transition-colors`}
                                >
                                    {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Session Stats */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="grid grid-cols-2 gap-3 text-center">
                            <div>
                                <div className="text-lg font-bold text-white">{stats?.questionsAnswered || 0}</div>
                                <div className="text-[10px] text-muted-foreground uppercase">Answered</div>
                            </div>
                            <div>
                                <div className={`text-lg font-bold ${stats && stats.averageScore > 0 ? getScoreColor(stats.averageScore) : 'text-white/50'}`}>
                                    {stats && stats.averageScore > 0 ? stats.averageScore.toFixed(1) : '-'}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase">Avg Score</div>
                            </div>
                        </div>
                    </div>

                    {/* Hints Panel */}
                    {currentHints.length > 0 && (
                        <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                            <button
                                onClick={() => setShowHints(!showHints)}
                                className="w-full flex items-center justify-between text-sm font-medium text-yellow-300 mb-2"
                            >
                                <span className="flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    Thinking Points
                                </span>
                                <ChevronRight className={`transition-transform ${showHints ? 'rotate-90' : ''}`} size={14} />
                            </button>
                            {showHints && (
                                <ul className="text-xs text-yellow-200/70 space-y-1 list-disc ml-4">
                                    {currentHints.map((hint, i) => (
                                        <li key={i}>{hint}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => generateQuestion()}
                            disabled={isLoading}
                            className="flex-1 text-xs bg-white/5 hover:bg-white/10 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                            <RefreshCw size={12} />
                            Skip
                        </button>
                        <button
                            onClick={endInterview}
                            className="flex-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                            <StopCircle size={12} />
                            End
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
