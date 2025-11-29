
import React from 'react';
import { useStore } from '../lib/store';
import { History as HistoryIcon, X, Trash2, Clock } from 'lucide-react';

interface HistoryProps {
    isOpen: boolean;
    onClose: () => void;
}

export const History: React.FC<HistoryProps> = ({ isOpen, onClose }) => {
    const { history, clearHistory, setSourceText, setTranslatedText } = useStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6 relative border border-gray-200 dark:border-gray-800 max-h-[80vh] flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-2 mb-6 flex-shrink-0">
                    <HistoryIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">History</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {history.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No history yet.
                        </div>
                    ) : (
                        history.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    setSourceText(item.source);
                                    setTranslatedText(item.target);
                                    onClose();
                                }}
                                className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-1 text-xs text-gray-400">
                                        <Clock size={12} />
                                        <span>{new Date(item.timestamp).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 font-medium">
                                        {item.source}
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
                                        {item.target}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {history.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center flex-shrink-0">
                        <button
                            onClick={clearHistory}
                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        >
                            <Trash2 size={16} />
                            Clear History
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
