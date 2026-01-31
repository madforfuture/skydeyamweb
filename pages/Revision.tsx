import React, { useEffect, useState } from 'react';
import { DailyContent } from '../types';
import { getHistory } from '../utils/storage';
import { Icons } from '../components/Icons';
import WordCard from '../components/WordCard';

const Revision: React.FC = () => {
  const [history, setHistory] = useState<DailyContent[]>([]);
  const [expandedDate, setExpandedDate] = useState<string | null>(null);

  useEffect(() => {
    const allHistory = getHistory();
    // Sort by date descending
    const sorted = allHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    // Filter out today to make it strictly "Revision" (optional, but logical)
    const today = new Date().toISOString().split('T')[0];
    const past = sorted.filter(h => h.date !== today);
    setHistory(past);
  }, []);

  const toggleExpand = (date: string) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <Icons.History className="w-8 h-8 text-sky-500" />
          Revision History
        </h1>
        <p className="text-slate-500 mt-2">Revisit your past learning sessions to strengthen long-term memory.</p>
      </header>

      {history.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <Icons.Meaning className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">No past history found yet.</p>
          <p className="text-slate-400 text-sm mt-1">Come back tomorrow after learning today!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {history.map((entry, index) => (
            <div key={index} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <button 
                onClick={() => toggleExpand(entry.date + entry.jobRole)}
                className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-white transition-colors text-left"
              >
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {new Date(entry.date).toLocaleDateString(undefined, { dateStyle: 'full' })}
                  </h3>
                  <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">
                    {entry.jobRole}
                  </span>
                </div>
                <div className="text-slate-400">
                  {expandedDate === (entry.date + entry.jobRole) ? (
                    <Icons.Close className="w-5 h-5" />
                  ) : (
                    <Icons.Meaning className="w-5 h-5" />
                  )}
                </div>
              </button>

              {expandedDate === (entry.date + entry.jobRole) && (
                <div className="p-5 border-t border-slate-100 bg-white animate-in slide-in-from-top-2 duration-200">
                  <div className="grid gap-4">
                    {entry.words.map((word, wIdx) => (
                      <div key={wIdx} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-baseline justify-between">
                          <h4 className="font-bold text-slate-800">{word.word}</h4>
                          <span className="text-xs text-slate-400 italic">Memory Trick: {word.memoryTrick}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{word.meaning}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-400 italic text-center">"{entry.quote}"</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Revision;