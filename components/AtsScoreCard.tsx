import React from 'react';
import { AtsAnalysis } from '../types';
import { Icons } from './Icons';

interface AtsScoreCardProps {
  analysis: AtsAnalysis;
}

const AtsScoreCard: React.FC<AtsScoreCardProps> = ({ analysis }) => {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 border-green-500 bg-green-50";
    if (score >= 60) return "text-amber-600 border-amber-500 bg-amber-50";
    return "text-red-600 border-red-500 bg-red-50";
  };

  const scoreColor = getScoreColor(analysis.score);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Icons.Target className="w-5 h-5 text-blue-600" />
          ATS Scorecard
        </h3>
        <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 text-xl font-bold ${scoreColor}`}>
          {analysis.score}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Critical Issues</h4>
          <ul className="space-y-2">
            {analysis.criticalIssues.length > 0 ? analysis.criticalIssues.map((issue, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <Icons.Alert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                {issue}
              </li>
            )) : (
              <li className="text-sm text-green-600 flex items-center gap-2">
                <Icons.Check className="w-4 h-4" /> No critical issues found!
              </li>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Missing Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords.length > 0 ? analysis.missingKeywords.map((kw, idx) => (
              <span key={idx} className="px-2 py-1 bg-red-50 text-red-600 border border-red-100 rounded text-xs font-medium">
                {kw}
              </span>
            )) : (
              <span className="text-sm text-slate-500 italic">All key terms present.</span>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Matched Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {analysis.matchedKeywords.map((kw, idx) => (
              <span key={idx} className="px-2 py-1 bg-green-50 text-green-600 border border-green-100 rounded text-xs font-medium">
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtsScoreCard;