import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_INSTRUCTION, LEGACY_DEFAULT_INSTRUCTION } from './prompt';

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
    /** Not persisted: whether a translation is streaming in this window. */
    isTranslating: boolean;
    setProvider: (provider: Provider) => void;
    setApiKey: (key: string) => void;
    setOpenaiApiKey: (key: string) => void;
    setModel: (model: string) => void;
    setCustomPrompt: (prompt: string) => void;
    setTheme: (theme: Theme) => void;
    setSourceText: (text: string) => void;
    setTranslatedText: (text: string) => void;
    setIsTranslating: (value: boolean) => void;
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
            customPrompt: DEFAULT_INSTRUCTION,
            theme: 'mist',
            history: [],
            sourceText: '',
            translatedText: '',
            isTranslating: false,
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
            setIsTranslating: (isTranslating) => set({ isTranslating }),
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
            version: 1,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            partialize: ({ isTranslating, ...rest }) => rest,
            migrate: (persisted, version) => {
                const state = persisted as Partial<AppState>;
                // v0 -> v1: move users still on the old default prompt to the new one
                if (version < 1 && state.customPrompt === LEGACY_DEFAULT_INSTRUCTION) {
                    state.customPrompt = DEFAULT_INSTRUCTION;
                }
                return state as AppState;
            },
        }
    )
);
