import React, { useState } from 'react';
import { MCQ } from '../types';
import { Icons } from './Icons';

interface DailyChallengeProps {
  mcqs: MCQ[];
}

const DailyChallenge: React.FC<DailyChallengeProps> = ({ mcqs }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(mcqs.length).fill(-1));
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIndex: number, optionIndex: number) => {
    if (showResults) return;
    const newSelected = [...selectedAnswers];
    newSelected[qIndex] = optionIndex;
    setSelectedAnswers(newSelected);
  };

  const checkAnswers = () => {
    setShowResults(true);
  };

  const score = selectedAnswers.reduce((acc, curr, idx) => {
    return curr === mcqs[idx].correctAnswer ? acc + 1 : acc;
  }, 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 my-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 p-2 rounded-lg">
          <Icons.Brain className="w-6 h-6 text-indigo-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Daily Quick Recall</h2>
      </div>

      <div className="space-y-8">
        {mcqs.map((mcq, qIndex) => (
          <div key={qIndex} className="space-y-3">
            <h3 className="text-md font-semibold text-slate-800">
              {qIndex + 1}. {mcq.question}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {mcq.options.map((option, oIndex) => {
                let btnClass = "w-full text-left px-4 py-3 rounded-lg text-sm border transition-all ";
                
                if (showResults) {
                  if (oIndex === mcq.correctAnswer) {
                    btnClass += "bg-green-100 border-green-500 text-green-800 font-medium";
                  } else if (selectedAnswers[qIndex] === oIndex) {
                    btnClass += "bg-red-50 border-red-300 text-red-700";
                  } else {
                    btnClass += "bg-slate-50 border-slate-200 opacity-60";
                  }
                } else {
                  if (selectedAnswers[qIndex] === oIndex) {
                    btnClass += "bg-sky-100 border-sky-400 text-sky-900";
                  } else {
                    btnClass += "bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50";
                  }
                }

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelect(qIndex, oIndex)}
                    disabled={showResults}
                    className={btnClass}
                  >
                    {option}
                    {showResults && oIndex === mcq.correctAnswer && (
                      <Icons.Check className="w-4 h-4 inline ml-2 mb-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
            {showResults && (
              <p className="text-xs text-slate-500 italic mt-2 bg-slate-50 p-2 rounded">
                <span className="font-bold">Explanation:</span> {mcq.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      {!showResults ? (
        <button
          onClick={checkAnswers}
          disabled={selectedAnswers.includes(-1)}
          className="mt-6 w-full bg-slate-800 text-white py-3 rounded-xl font-semibold hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Check Answers
        </button>
      ) : (
        <div className="mt-6 p-4 bg-indigo-50 rounded-xl text-center">
          <p className="text-indigo-900 font-bold">
            You scored {score} / {mcqs.length}
          </p>
          <p className="text-indigo-700 text-sm mt-1">
            {score === mcqs.length ? "Perfect! Sky & Ghost are proud." : "Good effort! Keep growing."}
          </p>
        </div>
      )}
    </div>
  );
};

export default DailyChallenge;