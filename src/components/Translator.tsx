import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { translateTextStream } from '../lib/gemini';
import { translateTextStreamOpenAI } from '../lib/openai';
import { ArrowRight, Loader2, Copy, Check, X } from 'lucide-react';


export const Translator: React.FC = () => {
    const {
        provider, apiKey, openaiApiKey, model, customPrompt,
        sourceText, translatedText,
        setSourceText, setTranslatedText
    } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleTranslate = async () => {
        if (!sourceText.trim()) return;

        const currentKey = provider === 'gemini' ? apiKey : openaiApiKey;
        if (!currentKey) {
            setError(`Please enter your ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API Key in settings first.`);
            return;
        }

        setIsLoading(true);
        setError(null);
        setTranslatedText(''); // Clear previous translation

        try {
            const streamFunction = provider === 'gemini' ? translateTextStream : translateTextStreamOpenAI;

            const result = await streamFunction(
                currentKey,
                model,
                customPrompt,
                sourceText,
                (currentText) => setTranslatedText(currentText)
            );

            useStore.getState().addToHistory({
                source: sourceText,
                target: result,
            });
        } catch (err) {
            setError('Translation failed. Please check your API key and try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!translatedText) return;
        await navigator.clipboard.writeText(translatedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClear = () => {
        setSourceText('');
        setTranslatedText('');
        setError(null);
    };

    return (
        <div className="flex flex-col h-full gap-4">
            <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
                {/* Source Input */}
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Source Text</span>
                        {sourceText && (
                            <button
                                onClick={handleClear}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
                                title="Clear input"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <textarea
                        value={sourceText}
                        onChange={(e) => setSourceText(e.target.value)}
                        placeholder="Paste your text here..."
                        className="flex-1 w-full p-4 resize-none focus:outline-none bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400"
                    />
                </div>

                {/* Action Button (Mobile: Vertical, Desktop: Horizontal) */}
                <div className="flex items-center justify-center">
                    <button
                        onClick={handleTranslate}
                        disabled={isLoading || !sourceText.trim()}
                        className="group p-4 rounded-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white shadow-lg transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
                    >
                        {isLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <ArrowRight className="w-6 h-6 md:rotate-0 rotate-90 transition-transform group-hover:translate-x-1 md:group-hover:translate-x-1 group-hover:translate-y-0 md:group-hover:translate-y-0 translate-y-0" />
                        )}
                    </button>
                </div>

                {/* Translated Output */}
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Translation</span>
                        {translatedText && (
                            <button
                                onClick={copyToClipboard}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-500"
                                title="Copy to clipboard"
                            >
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                        )}
                    </div>
                    <div className="flex-1 p-4 overflow-auto">
                        {translatedText ? (
                            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                {translatedText}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600 italic">
                                Translation will appear here...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm text-center animate-in fade-in slide-in-from-bottom-2">
                    {error}
                </div>
            )}
        </div>
    );
};
