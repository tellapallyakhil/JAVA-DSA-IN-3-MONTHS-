import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
    zenMode: boolean;
    isMuted: boolean;
    selectedSound: string;
    isExpanded: boolean;
    
    // Actions
    setZenMode: (zenMode: boolean) => void;
    setIsMuted: (isMuted: boolean) => void;
    setSelectedSound: (selectedSound: string) => void;
    setIsExpanded: (isExpanded: boolean) => void;
    toggleZenMode: () => void;
    toggleMute: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            zenMode: false,
            isMuted: false,
            selectedSound: 'none',
            isExpanded: false,

            setZenMode: (zenMode) => set({ zenMode }),
            setIsMuted: (isMuted) => set({ isMuted }),
            setSelectedSound: (selectedSound) => set({ selectedSound }),
            setIsExpanded: (isExpanded) => set({ isExpanded }),
            toggleZenMode: () => set((state) => ({ zenMode: !state.zenMode })),
            toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
        }),
        {
            name: 'dsaprep-ui-settings',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
