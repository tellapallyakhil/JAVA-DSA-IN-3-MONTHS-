import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerConfig {
    duration: number;
    label: string;
}

interface TimerState {
    mode: TimerMode;
    timeLeft: number;
    isRunning: boolean;
    completedPomodoros: number;
    dailyMinutes: number;
    config: Record<TimerMode, TimerConfig>;
    
    // Actions
    setMode: (mode: TimerMode) => void;
    setTimeLeft: (time: number | ((prev: number) => number)) => void;
    setIsRunning: (isRunning: boolean) => void;
    setCompletedPomodoros: (count: number) => void;
    addDailyMinutes: (mins: number) => void;
    updateConfig: (mode: TimerMode, mins: number) => void;
    resetTimer: () => void;
}

const DEFAULT_CONFIG: Record<TimerMode, TimerConfig> = {
    focus: { duration: 25 * 60, label: 'Work' },
    shortBreak: { duration: 5 * 60, label: 'Break' },
    longBreak: { duration: 15 * 60, label: 'Deep Break' },
};

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            mode: 'focus',
            timeLeft: DEFAULT_CONFIG.focus.duration,
            isRunning: false,
            completedPomodoros: 0,
            dailyMinutes: 0,
            config: DEFAULT_CONFIG,

            setMode: (mode) => set({ 
                mode, 
                timeLeft: get().config[mode].duration, 
                isRunning: false 
            }),

            setTimeLeft: (time) => set((state) => ({ 
                timeLeft: typeof time === 'function' ? time(state.timeLeft) : time 
            })),

            setIsRunning: (isRunning) => set({ isRunning }),

            setCompletedPomodoros: (count) => set({ completedPomodoros: count }),

            addDailyMinutes: (mins) => set((state) => ({ dailyMinutes: state.dailyMinutes + mins })),

            updateConfig: (mode, mins) => set((state) => {
                const newDuration = mins * 60;
                const newConfig = { ...state.config, [mode]: { ...state.config[mode], duration: newDuration } };
                return {
                    config: newConfig,
                    timeLeft: state.mode === mode ? newDuration : state.timeLeft,
                    isRunning: state.mode === mode ? false : state.isRunning
                };
            }),

            resetTimer: () => set((state) => ({
                timeLeft: state.config[state.mode].duration,
                isRunning: false
            })),
        }),
        {
            name: 'dsaprep-timer-storage', // Note: We will handle user scoping in the component/provider level if needed, 
                                          // but for now, we'll use a unique key. 
                                          // Better yet, we can use a dynamic storage name.
            storage: createJSONStorage(() => localStorage),
        }
    )
);
