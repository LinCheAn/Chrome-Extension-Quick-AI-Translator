import React from 'react';
import { useStore } from '../lib/store';
import { X, Trash2, Clock } from 'lucide-react';

interface HistoryProps {
    isOpen: boolean;
    onClose: () => void;
}

export const History: React.FC<HistoryProps> = ({ isOpen, onClose }) => {
    const { history, clearHistory, setSourceText, setTranslatedText } = useStore();

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 pt-4 pb-3 flex-shrink-0">
                    <h2 className="text-base font-semibold">History</h2>
                    <button onClick={onClose} className="icon-btn -mr-2" title="Close">
                        <X size={18} />
                    </button>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4 space-y-2">
                    {history.length === 0 ? (
                        <div className="text-center text-sm text-muted py-10">
                            No history yet.
                        </div>
                    ) : (
                        history.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setSourceText(item.source);
                                    setTranslatedText(item.target);
                                    onClose();
                                }}
                                className="block w-full text-left p-3 rounded-lg border border-line bg-bg/50 hover:border-accent/50 hover:bg-accent-soft/40 transition-colors"
                            >
                                <div className="flex items-center gap-1 text-[11px] text-muted mb-1.5">
                                    <Clock size={11} />
                                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-muted line-clamp-2">{item.source}</p>
                                <p className="text-sm text-ink line-clamp-2 mt-1">{item.target}</p>
                            </button>
                        ))
                    )}
                </div>

                {history.length > 0 && (
                    <div className="px-5 py-3 border-t border-line flex justify-between items-center flex-shrink-0">
                        <button
                            onClick={clearHistory}
                            className="flex items-center gap-1.5 text-sm text-danger hover:opacity-80 transition-opacity"
                        >
                            <Trash2 size={15} />
                            Clear History
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-1.5 text-sm font-medium rounded-lg bg-subtle text-ink hover:bg-line transition-colors"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
