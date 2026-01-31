import React from 'react';
import { Icons } from './Icons';
import { VocabularyWord } from '../types';

interface WordCardProps {
  data: VocabularyWord;
  index: number;
}

const WordCard: React.FC<WordCardProps> = ({ data, index }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow duration-300 overflow-hidden group">
      <div className="h-2 bg-sky-500 w-0 group-hover:w-full transition-all duration-500" />
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-slate-800 capitalize">{data.word}</h3>
          <span className="text-xs font-semibold text-sky-500 bg-sky-50 px-2 py-1 rounded-full">
            #{index + 1}
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Icons.Meaning className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
            <p className="text-slate-600 text-sm leading-relaxed">{data.meaning}</p>
          </div>

          <div className="flex gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <Icons.Job className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <p className="text-slate-700 text-sm font-medium italic">"{data.example}"</p>
          </div>

          <div className="flex gap-3">
            <Icons.Memory className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wide">Memory Trick</span>
              <p className="text-slate-600 text-sm">{data.memoryTrick}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordCard;