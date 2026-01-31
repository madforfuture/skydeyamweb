import React, { useEffect, useState } from 'react';
import { Icons } from '../components/Icons';
import WordCard from '../components/WordCard';
import DailyChallenge from '../components/DailyChallenge';
import { DailyContent, JobRole } from '../types';
import { generateDailyContent } from '../services/geminiService';
import { getContentForDate, saveToHistory, getStoredJobRole, setStoredJobRole } from '../utils/storage';

const Vocabulary: React.FC = () => {
  const [role, setRole] = useState<JobRole>(getStoredJobRole());
  const [content, setContent] = useState<DailyContent | null>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadContent(role);
    setStoredJobRole(role);
  }, [role]);

  const loadContent = async (selectedRole: JobRole) => {
    // 1. Check local storage first
    const stored = getContentForDate(today, selectedRole);
    if (stored) {
      setContent(stored);
      return;
    }

    // 2. Fetch from API if not found
    setLoading(true);
    try {
      const newContent = await generateDailyContent(selectedRole);
      // Enforce current role/date on the data to avoid mismatch
      newContent.jobRole = selectedRole;
      newContent.date = today;
      
      setContent(newContent);
      saveToHistory(newContent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as JobRole);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-20 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Daily Vocabulary
          </h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="relative">
          <Icons.Job className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={role}
            onChange={handleRoleChange}
            className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none appearance-none text-sm font-semibold text-slate-700 w-64"
          >
            {Object.values(JobRole).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <Icons.Down className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </header>

      {loading ? (
        <div className="text-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-slate-500 animate-pulse">Curating today's learning list for {role}...</p>
        </div>
      ) : content ? (
        <div className="space-y-8">
          <div className="grid md:grid-cols-1 gap-6">
            {content.words.map((word, index) => (
              <WordCard key={index} data={word} index={index} />
            ))}
          </div>

          {content.mcqs && <DailyChallenge mcqs={content.mcqs} />}

          <div className="text-center bg-gradient-to-r from-sky-50 to-indigo-50 p-8 rounded-2xl border border-sky-100">
            <Icons.Star className="w-6 h-6 text-sky-500 mx-auto mb-3" />
            <p className="text-lg font-serif italic text-slate-700">"{content.quote}"</p>
            <p className="text-sm text-sky-600 font-semibold mt-4">
              Come back tomorrow for new words!
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500">No content available. Please try refreshing.</p>
        </div>
      )}
    </div>
  );
};

export default Vocabulary;