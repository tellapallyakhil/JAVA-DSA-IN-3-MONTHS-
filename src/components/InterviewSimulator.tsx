'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, Video, Users, AlertCircle, PlayCircle, StopCircle, RefreshCw, Loader2 } from 'lucide-react';

interface Question {
    id: number;
    question: string;
    type: string;
    hints: string[];
}

const INITIAL_QUESTION: Question = {
    id: 1,
    question: "Can you explain the difference between processes and threads?",
    type: "Technical",
    hints: ["Think about memory sharing", "Consider context switch overhead"]
};

export default function InterviewSimulator() {
    const [isActive, setIsActive] = useState(false);
    const [question, setQuestion] = useState<Question>(INITIAL_QUESTION);
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0 && isActive) {
            setIsActive(false);
            setIsRecording(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timer]);

    const startSession = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsActive(true);
            setIsRecording(true);
            setTimer(300); // 5 minutes standard
        } catch (err) {
            console.error("Camera access denied", err);
            // Fallback for non-camera environments (development)
            setIsActive(true);
            setIsRecording(true);
            setTimer(300);
        }
    };

    const stopSession = () => {
        setIsActive(false);
        setIsRecording(false);
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    const generateQuestion = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/interview', {
                method: 'POST',
                body: JSON.stringify({
                    topic: 'Data Structures and Algorithms',
                    type: 'technical'
                })
            });

            if (!res.ok) throw new Error('API Error');

            const data = await res.json();
            setQuestion({
                id: Date.now(),
                question: data.question || "Describe a challenging bug you fixed.",
                type: 'Technical',
                hints: data.hints || ["Explain the context", "Detail your solution"]
            });
        } catch (error) {
            console.error(error);
            // Fallback if API fails (e.g. key missing)
            setQuestion({
                id: Date.now(),
                question: "Explain the concept of Dependency Injection.",
                type: 'Technical',
                hints: ["Think about loose coupling", "Inversion of Control"]
            });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="glass-card p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Users className="text-pink-500" />
                        AI Interview Simulator
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">Practice behavioral and technical questions</p>
                </div>
                {isActive && (
                    <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-sm font-mono animate-pulse flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        REC {formatTime(timer)}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Video Feed */}
                <div className="aspect-video bg-black/40 rounded-xl overflow-hidden relative border border-white/10 group">
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    {!isActive && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                            <Video size={48} className="text-white/20 mb-4" />
                            <button
                                onClick={startSession}
                                className="bg-white text-black px-6 py-2 rounded-full font-medium hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                <PlayCircle size={20} />
                                Start Interview
                            </button>
                        </div>
                    )}
                    {isActive && (
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md">
                                <Mic size={20} />
                            </button>
                            <button
                                onClick={stopSession}
                                className="p-3 rounded-full bg-red-500 hover:bg-red-600 shadow-lg"
                            >
                                <StopCircle size={20} className="text-white" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Question Panel */}
                <div className="flex flex-col h-full bg-white/5 rounded-xl p-6 border border-white/5">
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                                {question.type} Question
                            </div>
                            <button
                                onClick={generateQuestion}
                                disabled={loading}
                                className="text-xs flex items-center gap-1 hover:text-white text-muted-foreground transition-colors"
                            >
                                {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                                New Question
                            </button>
                        </div>

                        <h3 className="text-lg font-medium leading-relaxed mb-6 min-h-[80px]">
                            {loading ? "Generating question..." : `"${question.question}"`}
                        </h3>

                        {isActive && !loading && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-sm text-yellow-200 font-medium mb-1">Key Talking Points</p>
                                            <ul className="text-xs text-yellow-200/70 list-disc ml-4 space-y-1">
                                                {question.hints.map((hint, i) => (
                                                    <li key={i}>{hint}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end pt-6 border-t border-white/5">
                        <button
                            onClick={generateQuestion}
                            disabled={loading}
                            className="text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            Next Question
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
