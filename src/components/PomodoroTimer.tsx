'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Volume2, VolumeX, Maximize2, Minimize2, Sparkles, Layout, BarChart2, Bell, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerConfig {
    duration: number;
    label: string;
    icon: any;
    color: string;
}

const DEFAULT_SETTINGS: Record<TimerMode, TimerConfig> = {
    focus: { duration: 25 * 60, label: 'Work', icon: Brain, color: 'from-violet-600 to-purple-600' },
    shortBreak: { duration: 5 * 60, label: 'Break', icon: Coffee, color: 'from-green-500 to-emerald-600' },
    longBreak: { duration: 15 * 60, label: 'Deep Break', icon: Coffee, color: 'from-blue-500 to-cyan-600' },
};

const AMBIENT_SOUNDS = [
    { id: 'none', label: 'None', url: null },
    { id: 'rain', label: '🌧️', url: 'https://assets.mixkit.co/active_storage/sfx/2529/2529-preview.mp3' },
    { id: 'fire', label: '🔥', url: 'https://assets.mixkit.co/active_storage/sfx/2528/2528-preview.mp3' },
    { id: 'nature', label: '🌿', url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3' },
    { id: 'lofi', label: '🎹', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
];

const FOCUS_QUOTES = [
    "Focus is the art of saying no to everything else.",
    "Deep work is the superpower of the 21st century.",
    "Small steps every day lead to big results.",
    "Don't stop until you're proud.",
];

export default function PomodoroTimer() {
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<TimerMode>('focus');
    const [config, setConfig] = useState(DEFAULT_SETTINGS);
    const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focus.duration);
    const [isRunning, setIsRunning] = useState(false);
    const [completedPomodoros, setCompletedPomodoros] = useState(0);
    const [selectedSound, setSelectedSound] = useState('none');
    const [isMuted, setIsMuted] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [zenMode, setZenMode] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [dailyMinutes, setDailyMinutes] = useState(0);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(FOCUS_QUOTES[0]);
    
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // 1. Initialization & Hydration Safety
    useEffect(() => {
        setMounted(true);
        const savedConfig = localStorage.getItem('dsaprep_timer_config');
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            const newConfig = {
                focus: { ...DEFAULT_SETTINGS.focus, duration: parsed.focus || DEFAULT_SETTINGS.focus.duration },
                shortBreak: { ...DEFAULT_SETTINGS.shortBreak, duration: parsed.shortBreak || DEFAULT_SETTINGS.shortBreak.duration },
                longBreak: { ...DEFAULT_SETTINGS.longBreak, duration: parsed.longBreak || DEFAULT_SETTINGS.longBreak.duration },
            };
            setConfig(newConfig);
            setTimeLeft(newConfig.focus.duration);
        }

        const savedMins = localStorage.getItem('dsaprep_focus_mins');
        if (savedMins) setDailyMinutes(parseInt(savedMins));
        
        const savedPomodoros = localStorage.getItem('dsaprep_pomodoros');
        if (savedPomodoros) setCompletedPomodoros(parseInt(savedPomodoros));

        if ("Notification" in window && Notification.permission === "granted") {
            setNotificationsEnabled(true);
        }
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // 2. Tab Title Sync
    useEffect(() => {
        if (!mounted) return;
        if (isRunning) {
            document.title = `${formatTime(timeLeft)} | Focus`;
        } else {
            document.title = 'DSAPrep | Master DSA';
        }
    }, [timeLeft, isRunning, mounted]);

    const handleConfigChange = (m: TimerMode, mins: string) => {
        const val = Math.max(1, parseInt(mins) || 1);
        const newSeconds = val * 60;
        const newConfig = { ...config, [m]: { ...config[m], duration: newSeconds } };
        setConfig(newConfig);
        localStorage.setItem('dsaprep_timer_config', JSON.stringify({
            focus: newConfig.focus.duration,
            shortBreak: newConfig.shortBreak.duration,
            longBreak: newConfig.longBreak.duration
        }));
        if (mode === m) {
            setTimeLeft(newSeconds);
            setIsRunning(false);
        }
    };

    const switchMode = useCallback((newMode: TimerMode) => {
        setMode(newMode);
        setTimeLeft(config[newMode].duration);
        setIsRunning(false);
    }, [config]);

    const handleComplete = useCallback(() => {
        setIsRunning(false);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.8 }, zIndex: 200 });

        if (!isMuted) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.volume = 0.5;
            audio.play().catch(() => { });
        }

        if (mode === 'focus') {
            const newCount = completedPomodoros + 1;
            setCompletedPomodoros(newCount);
            localStorage.setItem('dsaprep_pomodoros', newCount.toString());
            if (newCount % 4 === 0) switchMode('longBreak');
            else switchMode('shortBreak');
        } else {
            switchMode('focus');
        }
    }, [mode, completedPomodoros, isMuted, switchMode]);

    // 3. High-Precision Timer (Fixed Drift Bug)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleComplete();
                        return 0;
                    }
                    return prev - 1;
                });
                
                if (mode === 'focus') {
                    setDailyMinutes(d => {
                        const next = d + (1/60);
                        if (Math.floor(next) > Math.floor(d)) localStorage.setItem('dsaprep_focus_mins', Math.floor(next).toString());
                        return next;
                    });
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, handleComplete, mode]);

    // 4. Audio Engine (Fixed Memory Leak)
    useEffect(() => {
        const sound = AMBIENT_SOUNDS.find(s => s.id === selectedSound);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        if (sound?.url && isRunning && !isMuted) {
            const audio = new Audio(sound.url);
            audio.loop = true;
            audio.volume = 0.3;
            audio.play().catch(() => { });
            audioRef.current = audio;
        }
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [selectedSound, isRunning, isMuted]);

    const reset = () => {
        setTimeLeft(config[mode].duration);
        setIsRunning(false);
    };

    const startTimer = () => {
        setIsRunning(true);
        setCurrentQuote(FOCUS_QUOTES[Math.floor(Math.random() * FOCUS_QUOTES.length)]);
    };

    const progress = ((config[mode].duration - timeLeft) / config[mode].duration) * 100;
    const CurrentIcon = config[mode].icon;

    if (!mounted) return null; // Prevent hydration flash

    return (
        <>
            <AnimatePresence>
                {zenMode && isExpanded && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[45] pointer-events-none" />}
            </AnimatePresence>

            <div className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] transition-all duration-500 ${isExpanded ? 'w-[92vw] sm:w-80' : 'w-auto'}`}>
                {!isExpanded ? (
                    <motion.button 
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setIsExpanded(true)}
                        className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl relative border border-white/10"
                    >
                        <Brain size={26} />
                        {isRunning && <span className="absolute -top-1 -right-1 bg-emerald-500 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse border-2 border-zinc-900">{formatTime(timeLeft)}</span>}
                    </motion.button>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0, y: 100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="bg-zinc-900/98 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                        <div className={`bg-gradient-to-r ${config[mode].color} p-5 flex items-center justify-between`}>
                            <div className="flex items-center gap-3">
                                <CurrentIcon size={20} className={isRunning ? 'animate-pulse' : ''} />
                                <span className="text-sm font-black uppercase tracking-[0.2em]">{config[mode].label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-xl transition-all ${showSettings ? 'bg-white/30 rotate-90' : 'hover:bg-white/20'}`}><Settings2 size={18} /></button>
                                <button onClick={() => setZenMode(!zenMode)} className={`p-2 rounded-xl transition-all ${zenMode ? 'bg-white/30' : 'hover:bg-white/20'}`}><Layout size={18} /></button>
                                <button onClick={() => setIsExpanded(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"><Minimize2 size={18} /></button>
                            </div>
                        </div>

                        <div className="px-5 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between text-[10px] font-black text-zinc-500">
                            <div className="flex items-center gap-2"><BarChart2 size={12} className="text-emerald-400" /> {Math.floor(dailyMinutes)} MINS FOCUS</div>
                            <div className="flex gap-1">
                                {[...Array(4)].map((_, i) => <div key={i} className={`w-2 h-2 rounded-full ${i < (completedPomodoros % 4) ? 'bg-white' : 'bg-white/20'}`} />)}
                            </div>
                        </div>

                        <div className="p-7">
                            <AnimatePresence mode="wait">
                                {showSettings ? (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4 py-4">
                                        {(Object.keys(DEFAULT_SETTINGS) as TimerMode[]).map(m => (
                                            <div key={m} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{DEFAULT_SETTINGS[m].label}</span>
                                                <div className="flex items-center gap-2">
                                                    <input type="number" value={config[m].duration / 60} onChange={(e) => handleConfigChange(m, e.target.value)}
                                                        className="w-16 bg-zinc-800 border border-white/10 rounded-lg px-2 py-1 text-center text-sm font-black text-white outline-none focus:border-primary" />
                                                    <span className="text-[10px] font-bold text-zinc-600 uppercase">Min</span>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-primary/20 text-primary hover:bg-primary/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Save Config</button>
                                    </motion.div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                                        <div className="relative w-48 h-48 mx-auto mb-8">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="96" cy="96" r="88" strokeWidth="8" fill="none" className="stroke-white/5" />
                                                <motion.circle cx="96" cy="96" r="88" strokeWidth="8" fill="none" strokeLinecap="round"
                                                    className="stroke-primary" strokeDasharray={552.9} initial={{ strokeDashoffset: 552.9 }}
                                                    animate={{ strokeDashoffset: 552.9 - (progress / 100) * 552.9 }} transition={{ duration: 1, ease: "linear" }} />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-5xl font-mono font-black text-white tracking-tighter select-none">{formatTime(timeLeft)}</span>
                                                <div className="flex gap-1.5 mt-2">
                                                    {AMBIENT_SOUNDS.filter(s => s.id !== 'none').map(s => (
                                                        <button key={s.id} onClick={() => setSelectedSound(s.id === selectedSound ? 'none' : s.id)}
                                                            className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all ${selectedSound === s.id ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' : 'bg-white/5 text-zinc-600 hover:text-zinc-400'}`}>
                                                            {s.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-[11px] text-zinc-400 italic mb-8 px-4 h-8 line-clamp-2">"{currentQuote}"</p>

                                        <div className="flex items-center justify-center gap-5 mb-8">
                                            <button onClick={reset} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 transition-all active:scale-90"><RotateCcw size={20} /></button>
                                            <button onClick={isRunning ? () => setIsRunning(false) : startTimer} 
                                                className={`p-6 rounded-[2rem] text-white transition-all shadow-2xl active:scale-95 ${isRunning ? 'bg-rose-500 shadow-rose-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
                                                {isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                                            </button>
                                            <button onClick={() => setIsMuted(!isMuted)} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 text-zinc-400 transition-all active:scale-90">
                                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            {(Object.keys(DEFAULT_SETTINGS) as TimerMode[]).map(m => (
                                                <button key={m} onClick={() => switchMode(m)}
                                                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white/10 text-white border border-white/20' : 'text-zinc-600 hover:text-zinc-400'}`}>
                                                    {DEFAULT_SETTINGS[m].label}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </div>
        </>
    );
}
