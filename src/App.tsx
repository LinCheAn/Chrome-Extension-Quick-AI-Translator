import { useState } from 'react';
import { Settings as SettingsIcon, Sparkles, History as HistoryIcon } from 'lucide-react';
import { Settings } from './components/Settings';
import { Translator } from './components/Translator';
import { History } from './components/History';

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors h-full">
      <div className="p-4 h-full flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                AI Translator
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Powered by Gemini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all hover:shadow-md text-gray-600 dark:text-gray-400"
              title="History"
            >
              <HistoryIcon className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all hover:shadow-md text-gray-600 dark:text-gray-400"
              title="Settings"
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 min-h-0">
          <Translator />
        </main>
      </div>

      <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <History isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
    </div>
  );
}

export default App;
