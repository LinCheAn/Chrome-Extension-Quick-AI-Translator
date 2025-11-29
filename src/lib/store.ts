import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryItem {
    id: string;
    source: string;
    target: string;
    timestamp: number;
}

interface AppState {
    provider: 'gemini' | 'openai';
    apiKey: string; // Gemini API Key
    openaiApiKey: string;
    model: string;
    customPrompt: string;
    history: HistoryItem[];
    sourceText: string;
    translatedText: string;
    setProvider: (provider: 'gemini' | 'openai') => void;
    setApiKey: (key: string) => void;
    setOpenaiApiKey: (key: string) => void;
    setModel: (model: string) => void;
    setCustomPrompt: (prompt: string) => void;
    setSourceText: (text: string) => void;
    setTranslatedText: (text: string) => void;
    addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
    clearHistory: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            provider: 'gemini',
            apiKey: '',
            openaiApiKey: '',
            model: 'gemini-2.5-flash',
            customPrompt: 'Translate the following academic text to Traditional Chinese, maintaining professional terminology and academic tone:',
            history: [],
            sourceText: '',
            translatedText: '',
            setProvider: (provider) => set({ provider }),
            setApiKey: (apiKey) => set({ apiKey }),
            setOpenaiApiKey: (openaiApiKey) => set({ openaiApiKey }),
            setModel: (model) => set({ model }),
            setCustomPrompt: (customPrompt) => set({ customPrompt }),
            setSourceText: (sourceText) => set({ sourceText }),
            setTranslatedText: (translatedText) => set({ translatedText }),
            addToHistory: (item) =>
                set((state) => ({
                    history: [
                        {
                            ...item,
                            id: crypto.randomUUID(),
                            timestamp: Date.now(),
                        },
                        ...state.history,
                    ].slice(0, 10),
                })),
            clearHistory: () => set({ history: [] }),
        }),
        {
            name: 'ai-translator-storage',
        }
    )
);
