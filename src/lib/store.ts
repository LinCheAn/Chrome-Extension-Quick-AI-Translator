import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryItem {
    id: string;
    source: string;
    target: string;
    timestamp: number;
}

/** 'local' = Chrome's built-in Gemini Nano (no API key) */
export type Provider = 'local' | 'gemini' | 'openai';
export type Theme = 'mist' | 'sage' | 'rose';

export const THEMES: { id: Theme; label: string }[] = [
    { id: 'mist', label: 'Mist Blue' },
    { id: 'sage', label: 'Sage Green' },
    { id: 'rose', label: 'Dusty Rose' },
];

interface AppState {
    provider: Provider;
    apiKey: string; // Gemini API Key
    openaiApiKey: string;
    model: string;
    customPrompt: string;
    theme: Theme;
    history: HistoryItem[];
    sourceText: string;
    translatedText: string;
    setProvider: (provider: Provider) => void;
    setApiKey: (key: string) => void;
    setOpenaiApiKey: (key: string) => void;
    setModel: (model: string) => void;
    setCustomPrompt: (prompt: string) => void;
    setTheme: (theme: Theme) => void;
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
            theme: 'mist',
            history: [],
            sourceText: '',
            translatedText: '',
            setProvider: (provider) =>
                set((state) => {
                    // Swap out a model name that clearly belongs to the other API
                    let model = state.model;
                    if (provider === 'openai' && model.startsWith('gemini')) model = 'gpt-4o-mini';
                    if (provider === 'gemini' && model.startsWith('gpt')) model = 'gemini-2.5-flash';
                    return { provider, model };
                }),
            setApiKey: (apiKey) => set({ apiKey }),
            setOpenaiApiKey: (openaiApiKey) => set({ openaiApiKey }),
            setModel: (model) => set({ model }),
            setCustomPrompt: (customPrompt) => set({ customPrompt }),
            setTheme: (theme) => set({ theme }),
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
