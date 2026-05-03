'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Volume2, VolumeX, Layout, BarChart2, Settings2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useTimerStore } from '@/store/useTimerStore';
import { useSettingsStore } from '@/store/useSettingsStore';

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
    const { 
        mode, timeLeft, isRunning, config, completedPomodoros, dailyMinutes,
        setMode, setTimeLeft, setIsRunning, setCompletedPomodoros, addDailyMinutes, updateConfig, resetTimer 
    } = useTimerStore();

    const { 
        zenMode, isMuted, selectedSound, isExpanded, 
        toggleZenMode, toggleMute, setSelectedSound, setIsExpanded 
    } = useSettingsStore();

    const [showSettings, setShowSettings] = useState(false);
    const [currentQuote, setCurrentQuote] = useState(FOCUS_QUOTES[0]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => { setMounted(true); }, []);

    // Tab Title Sync
    useEffect(() => {
        if (!mounted) return;
        const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
        document.title = isRunning ? `${formatTime(timeLeft)} | Focus` : 'DSAPrep | Master DSA';
    }, [timeLeft, isRunning, mounted]);

    // Timer Logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                if (timeLeft <= 0) {
                    handleComplete();
                } else {
                    setTimeLeft(t => t - 1);
                    if (mode === 'focus') addDailyMinutes(1/60);
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning, timeLeft, mode]);

    const handleComplete = () => {
        setIsRunning(false);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.8 }, zIndex: 200 });
        if (!isMuted) new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{});
        
        if (mode === 'focus') {
            const next = completedPomodoros + 1;
            setCompletedPomodoros(next);
            setMode(next % 4 === 0 ? 'longBreak' : 'shortBreak');
        } else {
            setMode('focus');
        }
    };

    // Ambient Audio
    useEffect(() => {
        const sound = AMBIENT_SOUNDS.find(s => s.id === selectedSound);
        if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
        if (sound?.url && isRunning && !isMuted) {
            const audio = new Audio(sound.url);
            audio.loop = true; audio.volume = 0.3;
            audio.play().catch(() => { });
            audioRef.current = audio;
        }
        return () => { if (audioRef.current) audioRef.current.pause(); };
    }, [selectedSound, isRunning, isMuted]);

    if (!mounted) return null;

    const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
    const progress = ((config[mode].duration - timeLeft) / config[mode].duration) * 100;

    return (
        <>
            <AnimatePresence>
                {zenMode && isExpanded && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[45] pointer-events-none" />}
            </AnimatePresence>

            <div className={`fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100] transition-all duration-500 ${isExpanded ? 'w-[92vw] sm:w-80' : 'w-auto'}`}>
                {!isExpanded ? (
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsExpanded(true)} className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl relative border border-white/10">
                        <Brain size={26} />
                        {isRunning && <span className="absolute -top-1 -right-1 bg-emerald-500 text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse border-2 border-zinc-900">{formatTime(timeLeft)}</span>}
                    </motion.button>
                ) : (
                    <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/98 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className={`bg-gradient-to-r from-violet-600 to-indigo-600 p-5 flex items-center justify-between`}>
                            <div className="flex items-center gap-3"><Brain size={20} /><span className="text-sm font-black uppercase tracking-widest">{config[mode].label}</span></div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-white/20 rounded-xl transition-all"><Settings2 size={18} /></button>
                                <button onClick={toggleZenMode} className={`p-2 rounded-xl transition-all ${zenMode ? 'bg-white/30' : 'hover:bg-white/20'}`}><Layout size={18} /></button>
                                <button onClick={() => setIsExpanded(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all"><Minimize2 size={18} /></button>
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
                                        {(Object.keys(config) as any[]).map(m => (
                                            <div key={m} className="flex items-center justify-between bg-white/5 p-4 rounded-2xl">
                                                <span className="text-xs font-bold text-zinc-400 uppercase">{config[m as keyof typeof config].label}</span>
                                                <input type="number" value={config[m as keyof typeof config].duration / 60} onChange={(e) => updateConfig(m, parseInt(e.target.value))} className="w-16 bg-zinc-800 rounded-lg px-2 py-1 text-center text-sm font-black" />
                                            </div>
                                        ))}
                                        <button onClick={() => setShowSettings(false)} className="w-full py-4 bg-primary/20 text-primary rounded-xl text-[10px] font-black uppercase">Close Settings</button>
                                    </motion.div>
                                ) : (
                                    <div className="text-center">
                                        <div className="relative w-48 h-48 mx-auto mb-6">
                                            <svg className="w-full h-full -rotate-90">
                                                <circle cx="96" cy="96" r="88" strokeWidth="8" fill="none" className="stroke-white/5" />
                                                <motion.circle cx="96" cy="96" r="88" strokeWidth="8" fill="none" strokeLinecap="round" className="stroke-primary" strokeDasharray={552.9} initial={{ strokeDashoffset: 552.9 }} animate={{ strokeDashoffset: 552.9 - (progress / 100) * 552.9 }} transition={{ duration: 1, ease: "linear" }} />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-5xl font-mono font-black text-white">{formatTime(timeLeft)}</span>
                                                <div className="flex gap-1.5 mt-2">
                                                    {AMBIENT_SOUNDS.filter(s => s.id !== 'none').map(s => (
                                                        <button key={s.id} onClick={() => setSelectedSound(s.id === selectedSound ? 'none' : s.id)} className={`w-7 h-7 rounded-lg text-xs flex items-center justify-center transition-all ${selectedSound === s.id ? 'bg-primary text-white scale-110' : 'bg-white/5 text-zinc-600'}`}>{s.label}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center gap-5 mb-6">
                                            <button onClick={resetTimer} className="p-4 rounded-2xl bg-white/5 text-zinc-400"><RotateCcw size={20} /></button>
                                            <button onClick={() => setIsRunning(!isRunning)} className={`p-6 rounded-[2rem] text-white shadow-2xl ${isRunning ? 'bg-rose-500' : 'bg-emerald-500'}`}>{isRunning ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}</button>
                                            <button onClick={toggleMute} className="p-4 rounded-2xl bg-white/5 text-zinc-400">{isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(Object.keys(config) as any[]).map(m => (
                                                <button key={m} onClick={() => setMode(m)} className={`py-3 rounded-xl text-[10px] font-black uppercase ${mode === m ? 'bg-white/10 text-white border border-white/20' : 'text-zinc-600'}`}>{config[m as keyof typeof config].label}</button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </div>
        </>
    );
}
