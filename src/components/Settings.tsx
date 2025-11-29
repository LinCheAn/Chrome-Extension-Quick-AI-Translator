import React from 'react';
import { useStore } from '../lib/store';
import { Settings as SettingsIcon, X } from 'lucide-react';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
    const {
        provider, apiKey, openaiApiKey, model, customPrompt,
        setProvider, setApiKey, setOpenaiApiKey, setModel, setCustomPrompt
    } = useStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 relative border border-gray-200 dark:border-gray-800">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-2 mb-6">
                    <SettingsIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Provider
                        </label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value as 'gemini' | 'openai')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                        >
                            <option value="gemini">Google Gemini</option>
                            <option value="openai">OpenAI</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            {provider === 'gemini' ? 'Gemini API Key' : 'OpenAI API Key'}
                        </label>
                        <input
                            type="password"
                            value={provider === 'gemini' ? apiKey : openaiApiKey}
                            onChange={(e) => provider === 'gemini' ? setApiKey(e.target.value) : setOpenaiApiKey(e.target.value)}
                            placeholder={`Enter your ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API Key`}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Your key is stored locally in your browser.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Model
                        </label>
                        <input
                            list="model-suggestions"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="Enter model name (e.g. gemini-1.5-flash)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-all"
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Custom Prompt
                        </label>
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none transition-all"
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
