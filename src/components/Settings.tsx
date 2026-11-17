import React, { useEffect, useState } from 'react';
import { useStore, THEMES, type Provider } from '../lib/store';
import { downloadLocalModel, getLocalModelStatus, type LocalModelStatus } from '../lib/chromeAI';
import { X, Check, Download, Loader2 } from 'lucide-react';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const PROVIDERS: { id: Provider; label: string; hint: string }[] = [
    { id: 'local', label: 'Chrome built-in', hint: 'Gemini Nano' },
    { id: 'gemini', label: 'Gemini', hint: 'API key' },
    { id: 'openai', label: 'OpenAI', hint: 'API key' },
];

const LOCAL_STATUS_TEXT: Record<LocalModelStatus, string> = {
    available: 'Ready. Translations run entirely on this device.',
    downloadable: 'The model needs a one-time download before first use.',
    downloading: 'The model is downloading…',
    unavailable: 'This device does not meet the requirements for the on-device model.',
    unsupported: 'Not supported in this browser. Requires desktop Chrome 138 or later.',
};

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
    const {
        provider, apiKey, openaiApiKey, model, customPrompt, theme,
        setProvider, setApiKey, setOpenaiApiKey, setModel, setCustomPrompt, setTheme
    } = useStore();

    const [localStatus, setLocalStatus] = useState<LocalModelStatus | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
    const [downloadError, setDownloadError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen || provider !== 'local') return;
        let cancelled = false;
        getLocalModelStatus().then((status) => {
            if (!cancelled) setLocalStatus(status);
        });
        return () => {
            cancelled = true;
        };
    }, [isOpen, provider]);

    if (!isOpen) return null;

    const handleDownload = async () => {
        setDownloadError(null);
        setDownloadProgress(0);
        try {
            await downloadLocalModel(setDownloadProgress);
        } catch (err) {
            setDownloadError(err instanceof Error ? err.message : 'Download failed.');
        } finally {
            setDownloadProgress(null);
            setLocalStatus(await getLocalModelStatus());
        }
    };

    const isDownloading = downloadProgress !== null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
                    <h2 className="text-base font-semibold">Settings</h2>
                    <button onClick={onClose} className="icon-btn -mr-2" title="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4 space-y-4">
                    {/* Theme */}
                    <div>
                        <span className="field-label">Color theme</span>
                        <div className="grid grid-cols-3 gap-2">
                            {THEMES.map((t) => {
                                const selected = theme === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id)}
                                        aria-pressed={selected}
                                        className={`relative p-2 rounded-lg border text-left transition-colors ${selected ? 'border-accent ring-2 ring-accent/25' : 'border-line hover:border-muted'}`}
                                    >
                                        {/* data-theme scopes the palette variables to this preview */}
                                        <div data-theme={t.id} className="h-9 rounded-md bg-bg border border-line flex items-center gap-1 px-1.5">
                                            <span className="h-5 flex-1 rounded bg-surface border border-line" />
                                            <span className="h-5 w-5 rounded bg-accent-soft" />
                                            <span className="h-5 w-5 rounded bg-accent" />
                                        </div>
                                        <div className="mt-1.5 flex items-center justify-between text-xs">
                                            <span className={selected ? 'text-ink font-medium' : 'text-muted'}>{t.label}</span>
                                            {selected && <Check size={13} className="text-accent" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Provider */}
                    <div>
                        <span className="field-label">Translation engine</span>
                        <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-subtle">
                            {PROVIDERS.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => setProvider(p.id)}
                                    aria-pressed={provider === p.id}
                                    className={`py-1.5 rounded-md text-center transition-colors ${provider === p.id ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
                                >
                                    <span className="block text-sm font-medium leading-tight">{p.label}</span>
                                    <span className="block text-[11px] opacity-75">{p.hint}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {provider === 'local' ? (
                        <div className="p-3 rounded-lg bg-accent-soft/50 border border-line text-sm space-y-2">
                            <p className="text-ink">
                                {localStatus ? LOCAL_STATUS_TEXT[localStatus] : 'Checking on-device model…'}
                            </p>
                            <p className="text-xs text-muted">
                                Uses the Gemini Nano model built into Chrome. No API key, and your text never leaves the browser.
                                Quality on long or technical passages is lower than the cloud models.
                            </p>
                            {(localStatus === 'downloadable' || localStatus === 'downloading' || isDownloading) && (
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent text-accent-fg hover:bg-accent-hover disabled:opacity-70 transition-colors"
                                >
                                    {isDownloading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
                                    {isDownloading ? `Downloading ${Math.round(downloadProgress * 100)}%` : 'Download model'}
                                </button>
                            )}
                            {downloadError && <p className="text-xs text-danger">{downloadError}</p>}
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="field-label" htmlFor="api-key">
                                    {provider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}
                                </label>
                                <input
                                    id="api-key"
                                    type="password"
                                    value={provider === 'gemini' ? apiKey : openaiApiKey}
                                    onChange={(e) => provider === 'gemini' ? setApiKey(e.target.value) : setOpenaiApiKey(e.target.value)}
                                    placeholder={`Enter your ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API Key`}
                                    className="field"
                                />
                                <p className="mt-1 text-xs text-muted">
                                    Your key is stored locally in your browser.
                                </p>
                            </div>

                            <div>
                                <label className="field-label" htmlFor="model">Model</label>
                                <input
                                    id="model"
                                    list="model-suggestions"
                                    value={model}
                                    onChange={(e) => setModel(e.target.value)}
                                    placeholder="Enter model name (e.g. gemini-1.5-flash)"
                                    className="field"
                                />
                                <datalist id="model-suggestions">
                                    {provider === 'gemini' ? (
                                        <>
                                            <option value="gemini-2.5-flash" />
                                            <option value="gemini-2.0-flash" />
                                            <option value="gemini-1.5-flash" />
                                            <option value="gemini-1.5-pro" />
                                        </>
                                    ) : (
                                        <>
                                            <option value="gpt-4o" />
                                            <option value="gpt-4o-mini" />
                                            <option value="gpt-4-turbo" />
                                            <option value="gpt-3.5-turbo" />
                                        </>
                                    )}
                                </datalist>
                            </div>
                        </>
                    )}

                    <div>
                        <label className="field-label" htmlFor="custom-prompt">Custom Prompt</label>
                        <textarea
                            id="custom-prompt"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            rows={3}
                            className="field resize-none"
                        />
                    </div>
                </div>

                <div className="px-5 py-3 border-t border-line flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 text-sm font-medium rounded-lg bg-accent text-accent-fg hover:bg-accent-hover transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
