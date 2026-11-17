import { useState } from 'react';
import { Settings as SettingsIcon, Languages, History as HistoryIcon } from 'lucide-react';
import { Settings } from './components/Settings';
import { Translator } from './components/Translator';
import { History } from './components/History';
import { useStore } from './lib/store';

const PROVIDER_LABEL = {
  local: 'Gemini Nano · on-device',
  gemini: 'Gemini API',
  openai: 'OpenAI API',
} as const;

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const provider = useStore((s) => s.provider);

  return (
    <div className="h-full flex flex-col p-4 gap-3">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-accent-soft text-accent">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight tracking-tight">AI Translator</h1>
            <p className="text-xs text-muted">{PROVIDER_LABEL[provider]}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => setIsHistoryOpen(true)} className="icon-btn" title="History">
            <HistoryIcon className="w-5 h-5" />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="icon-btn" title="Settings">
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 min-h-0">
        <Translator />
      </main>

      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <History isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  );
}

export default App;
