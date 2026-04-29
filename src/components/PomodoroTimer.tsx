'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

const TIMER_SETTINGS = {
    focus: { duration: 25 * 60, label: 'Focus Time', icon: Brain, color: 'from-violet-500 to-purple-600' },
    shortBreak: { duration: 5 * 60, label: 'Short Break', icon: Coffee, color: 'from-green-500 to-emerald-600' },
    longBreak: { duration: 15 * 60, label: 'Long Break', icon: Coffee, color: 'from-blue-500 to-cyan-600' },
};

// Ambient sound URLs (royalty-free)
const AMBIENT_SOUNDS = [
    { id: 'none', label: 'No Sound', url: null },
    { id: 'rain', label: '🌧️ Rain', url: 'https://assets.mixkit.co/active_storage/sfx/2529/2529-preview.mp3' },
    { id: 'fire', label: '🔥 Fireplace', url: 'https://assets.mixkit.co/active_storage/sfx/2528/2528-preview.mp3' },
    { id: 'nature', label: '🌿 Nature', url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3' },
];

export default function PomodoroTimer() {
    const [mode, setMode] = useState<TimerMode>('focus');
    const [timeLeft, setTimeLeft] = useState(TIMER_SETTINGS.focus.duration);
    const [isRunning, setIsRunning] = useState(false);
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const [selectedSound, setSelectedSound] = useState('none');
    const [isMuted, setIsMuted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode);
        setTimeLeft(TIMER_SETTINGS[newMode].duration);
        setIsRunning(false);
    }, []);

    const handleComplete = useCallback(() => {
        setIsRunning(false);

        // Play notification sound
        if (!isMuted) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => { });
        }

        if (mode === 'focus') {
            const newCount = completedPomodoros + 1;
            setCompletedPomodoros(newCount);

            // Every 4 pomodoros, suggest a long break
            if (newCount % 4 === 0) {
                switchMode('longBreak');
            } else {
                switchMode('shortBreak');
            }
        } else {
            switchMode('focus');
        }
    }, [mode, completedPomodoros, isMuted, switchMode]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleComplete();
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft, handleComplete]);

    // Handle ambient sound
    useEffect(() => {
        const sound = AMBIENT_SOUNDS.find(s => s.id === selectedSound);

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }

        if (sound?.url && isRunning && !isMuted) {
            audioRef.current = new Audio(sound.url);
            audioRef.current.loop = true;
            audioRef.current.volume = 0.3;
            audioRef.current.play().catch(() => { });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [selectedSound, isRunning, isMuted]);

    const reset = () => {
        setTimeLeft(TIMER_SETTINGS[mode].duration);
        setIsRunning(false);
    };

    const progress = ((TIMER_SETTINGS[mode].duration - timeLeft) / TIMER_SETTINGS[mode].duration) * 100;
    const CurrentIcon = TIMER_SETTINGS[mode].icon;

    if (!isExpanded) {
        // Compact floating button
        return (
            <button
                onClick={() => setIsExpanded(true)}
                className="fixed bottom-6 right-6 z-[40] bg-gradient-to-r from-violet-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform group"
                title="Open Pomodoro Timer"
            >
                <Brain size={24} />
                {isRunning && (
                    <span className="absolute -top-1 -right-1 bg-green-500 text-xs px-1.5 py-0.5 rounded-full animate-pulse">
                        {formatTime(timeLeft)}
                    </span>
                )}
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-[40] w-80 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className={`bg-gradient-to-r ${TIMER_SETTINGS[mode].color} p-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CurrentIcon size={20} />
                        <span className="font-bold">{TIMER_SETTINGS[mode].label}</span>
                    </div>
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="hover:bg-white/20 p-1 rounded-lg transition-colors"
                    >
                        <Minimize2 size={18} />
                    </button>
                </div>

                {/* Pomodoro count */}
                <div className="flex gap-1 mt-2">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${i < (completedPomodoros % 4) ? 'bg-white' : 'bg-white/30'}`}
                        />
                    ))}
                    <span className="text-xs ml-2 opacity-80">{completedPomodoros} completed</span>
                </div>
            </div>

            {/* Timer Display */}
            <div className="p-6 text-center">
                {/* Progress Ring */}
                <div className="relative w-40 h-40 mx-auto mb-4">
                    <svg className="w-full h-full -rotate-90">
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            strokeWidth="8"
                            fill="none"
                            className="stroke-white/10"
                        />
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                            className="stroke-primary transition-all duration-1000"
                            strokeDasharray={440}
                            strokeDashoffset={440 - (progress / 100) * 440}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-mono font-bold">{formatTime(timeLeft)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    <button
                        onClick={reset}
                        className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        title="Reset"
                    >
                        <RotateCcw size={20} />
                    </button>
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`p-4 rounded-full text-white transition-all ${isRunning
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                    >
                        {isRunning ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        title={isMuted ? 'Unmute' : 'Mute'}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>

                {/* Mode Switcher */}
                <div className="flex gap-2 mb-4">
                    {(Object.keys(TIMER_SETTINGS) as TimerMode[]).map((m) => (
                        <button
                            key={m}
                            onClick={() => switchMode(m)}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${mode === m
                                    ? 'bg-primary text-white'
                                    : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            {TIMER_SETTINGS[m].label}
                        </button>
                    ))}
                </div>

                {/* Ambient Sounds */}
                <div className="flex gap-2 justify-center">
                    {AMBIENT_SOUNDS.map((sound) => (
                        <button
                            key={sound.id}
                            onClick={() => setSelectedSound(sound.id)}
                            className={`px-3 py-1.5 rounded-full text-xs transition-all ${selectedSound === sound.id
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'bg-white/5 hover:bg-white/10'
                                }`}
                        >
                            {sound.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
