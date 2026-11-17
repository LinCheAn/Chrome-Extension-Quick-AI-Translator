import React, { useState } from 'react';
import { useStore } from '../lib/store';
import { translateTextStream } from '../lib/gemini';
import { translateTextStreamOpenAI } from '../lib/openai';
import { translateTextStreamLocal } from '../lib/chromeAI';
import { ArrowDown, Loader2, Copy, Check, X } from 'lucide-react';

export const Translator: React.FC = () => {
    const {
        provider, apiKey, openaiApiKey, model, customPrompt,
        sourceText, translatedText,
        setSourceText, setTranslatedText
    } = useStore();
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const canTranslate = !isLoading && sourceText.trim().length > 0;

    const handleTranslate = async () => {
        if (!canTranslate) return;

        const currentKey = provider === 'gemini' ? apiKey : openaiApiKey;
        if (provider !== 'local' && !currentKey) {
            setError(`Please enter your ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API Key in settings first.`);
            return;
        }

        setIsLoading(true);
        setError(null);
        setTranslatedText(''); // Clear previous translation

        try {
            let result: string;

            if (provider === 'local') {
                result = await translateTextStreamLocal(
                    customPrompt,
                    sourceText,
                    (currentText) => {
                        setStatus(null);
                        setTranslatedText(currentText);
                    },
                    (fraction) => setStatus(`Downloading on-device model… ${Math.round(fraction * 100)}%`)
                );
            } else {
                const streamFunction = provider === 'gemini' ? translateTextStream : translateTextStreamOpenAI;
                result = await streamFunction(
                    currentKey,
                    model,
                    customPrompt,
                    sourceText,
                    (currentText) => setTranslatedText(currentText)
                );
            }

            useStore.getState().addToHistory({
                source: sourceText,
                target: result,
            });
        } catch (err) {
            if (provider === 'local') {
                setError(err instanceof Error ? err.message : 'On-device translation failed.');
            } else {
                setError('Translation failed. Please check your API key and try again.');
            }
            console.error(err);
        } finally {
            setIsLoading(false);
            setStatus(null);
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

    const panel = 'flex-1 min-h-0 flex flex-col bg-surface rounded-xl border border-line overflow-hidden';
    const panelHeader = 'h-9 px-3 flex-shrink-0 flex justify-between items-center border-b border-line/70';
    const panelTitle = 'text-xs font-medium uppercase tracking-wider text-muted';
    const panelAction = 'p-1 rounded-md text-muted hover:bg-subtle hover:text-ink transition-colors';

    return (
        <div className="flex flex-col h-full gap-2.5">
            {/* Source Input */}
            <div className={`${panel} focus-within:border-accent/60 transition-colors`}>
                <div className={panelHeader}>
                    <span className={panelTitle}>Source</span>
                    {sourceText && (
                        <button onClick={handleClear} className={panelAction} title="Clear input">
                            <X size={15} />
                        </button>
                    )}
                </div>
                <textarea
                    value={sourceText}
                    onChange={(e) => setSourceText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleTranslate();
                    }}
                    placeholder="Paste your text here..."
                    className="flex-1 w-full px-3.5 py-3 text-sm leading-relaxed resize-none focus:outline-none bg-transparent text-ink placeholder:text-muted/60"
                />
            </div>

            {/* Action */}
            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={handleTranslate}
                    disabled={!canTranslate}
                    title="Translate (Ctrl/⌘ + Enter)"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium bg-accent text-accent-fg hover:bg-accent-hover disabled:bg-subtle disabled:text-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
                >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDown className="w-4 h-4" />}
                    {isLoading ? 'Translating' : 'Translate'}
                </button>
            </div>

            {/* Translated Output */}
            <div className={panel}>
                <div className={panelHeader}>
                    <span className={panelTitle}>Translation</span>
                    {translatedText && (
                        <button onClick={copyToClipboard} className={panelAction} title="Copy to clipboard">
                            {copied ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
                        </button>
                    )}
                </div>
                <div className="flex-1 px-3.5 py-3 overflow-auto text-sm leading-relaxed">
                    {translatedText ? (
                        <div className="whitespace-pre-wrap">{translatedText}</div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted/70">
                            {status ?? (isLoading ? 'Working…' : 'Translation will appear here')}
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div className="px-3 py-2 rounded-lg text-xs text-center text-danger bg-danger/10 border border-danger/20">
                    {error}
                </div>
            )}
        </div>
    );
};
