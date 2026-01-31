import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { OptimizationMode, ResumeAnalysisResult } from '../types';
import { analyzeResume } from '../services/geminiService';
import AtsScoreCard from '../components/AtsScoreCard';

const Home: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [mode, setMode] = useState<OptimizationMode>(OptimizationMode.IMPROVE);

  const handleGenerate = async () => {
    if (!jd.trim() || !resume.trim()) return;
    setLoading(true);
    try {
      const data = await analyzeResume(resume, jd, mode);
      setResult(data);
      setStep(2);
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleDownloadTxt = () => {
    if (!result) return;
    const textContent = `
PROFESSIONAL SUMMARY
${result.summary.optimized}

SKILLS
${result.skills.optimized}

EXPERIENCE
${result.experience.map(exp => `${exp.title}\n${exp.optimized}`).join('\n\n')}

EDUCATION
${result.education.optimized}
    `.trim();
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Step 1: Input Form
  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
            Optimize Your Resume in <span className="text-blue-600">Seconds</span>
          </h1>
          <p className="text-lg text-slate-500">
            Paste your Job Description and current Resume to get an ATS-ready version instantly.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Icons.Job className="w-4 h-4 text-blue-500" />
              Job Description (JD)
            </label>
            <textarea
              className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm text-sm"
              placeholder="Paste the full job description here..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Icons.Resume className="w-4 h-4 text-purple-500" />
              Your Current Resume
            </label>
            <textarea
              className="w-full h-64 p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none shadow-sm text-sm"
              placeholder="Paste your resume content here..."
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Optimization Mode:</span>
            <select 
              value={mode} 
              onChange={(e) => setMode(e.target.value as OptimizationMode)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.values(OptimizationMode).map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!jd || !resume || loading}
            className={`
              flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all
              ${!jd || !resume || loading ? 'bg-slate-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hover:scale-105 active:scale-95'}
            `}
          >
            {loading ? (
              <>
                <Icons.Refresh className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Icons.Magic className="w-5 h-5" />
                Generate Optimized Resume
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Analysis Results
  return (
    <>
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500 no-print">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
           <button 
            onClick={() => setStep(1)} 
            className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2"
          >
            ← Back to Editor
          </button>
          <h2 className="text-2xl font-bold text-slate-900">Optimization Results</h2>
        </div>
        <div className="flex gap-2">
           <button onClick={handleDownloadTxt} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 text-sm flex items-center gap-2">
            <Icons.Resume className="w-4 h-4" /> Download Text
           </button>
           <button onClick={() => window.print()} className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2 shadow-md shadow-blue-200">
             <Icons.Download className="w-4 h-4" /> Save as PDF
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: ATS Score */}
        <div className="lg:col-span-3">
          {result && <AtsScoreCard analysis={result.atsAnalysis} />}
        </div>

        {/* Right Column: Resume Sections */}
        <div className="lg:col-span-9 space-y-6">
          {result && (
            <>
              {/* Summary Section */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">Professional Summary</h3>
                  <button onClick={() => copyToClipboard(result.summary.optimized)} title="Copy Optimized">
                    <Icons.Layout className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-6">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-wide mb-2 block">Original</span>
                    <p className="text-sm text-slate-600 leading-relaxed">{result.summary.original}</p>
                  </div>
                  <div className="p-6 bg-blue-50/30">
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2 block flex items-center gap-1">
                      <Icons.Zap className="w-3 h-3" /> Optimized
                    </span>
                    <p className="text-sm text-slate-800 leading-relaxed font-medium">{result.summary.optimized}</p>
                    <div className="mt-4 p-3 bg-blue-100/50 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-800 italic">
                        <span className="font-bold">AI Feedback:</span> {result.summary.feedback}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

               {/* Skills Section */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800">Skills</h3>
                </div>
                <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                  <div className="p-6">
                     <span className="text-xs font-bold text-red-500 uppercase tracking-wide mb-2 block">Original</span>
                     <p className="text-sm text-slate-600 whitespace-pre-wrap">{result.skills.original}</p>
                  </div>
                  <div className="p-6 bg-blue-50/30">
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2 block">Optimized</span>
                    <p className="text-sm text-slate-800 whitespace-pre-wrap font-medium">{result.skills.optimized}</p>
                  </div>
                </div>
              </div>

              {/* Experience Section */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800">Experience</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {result.experience.map((exp, idx) => (
                    <div key={idx} className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                       <div className="p-6">
                        <h4 className="font-bold text-slate-700 text-sm mb-2">{exp.title} (Original)</h4>
                        <p className="text-sm text-slate-600 whitespace-pre-wrap">{exp.original}</p>
                      </div>
                      <div className="p-6 bg-blue-50/30">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-blue-700 text-sm">{exp.title} (Optimized)</h4>
                           <button onClick={() => copyToClipboard(exp.optimized)}>
                             <Icons.Layout className="w-4 h-4 text-slate-400 hover:text-blue-600" />
                           </button>
                        </div>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap font-medium">{exp.optimized}</p>
                        <p className="mt-3 text-xs text-slate-500 italic border-t border-slate-200 pt-2">
                          💡 {exp.feedback}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    {/* Printable Resume View (Hidden on screen, Visible on print) */}
    {result && (
      <div className="print-only bg-white p-8 max-w-4xl mx-auto text-slate-900">
        <div className="mb-8 border-b-2 border-slate-800 pb-4">
           <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">Resume</h1>
           <p className="text-sm text-slate-500 italic">Optimized by Smart Resume Maker</p>
        </div>

        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-800 border-b border-blue-200 mb-3 pb-1">Professional Summary</h2>
          <p className="text-sm leading-relaxed text-slate-800">{result.summary.optimized}</p>
        </section>

        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-800 border-b border-blue-200 mb-3 pb-1">Skills</h2>
          <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{result.skills.optimized}</p>
        </section>

        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-800 border-b border-blue-200 mb-3 pb-1">Experience</h2>
          <div className="space-y-4">
            {result.experience.map((exp, i) => (
              <div key={i}>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{exp.title}</h3>
                <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{exp.optimized}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-blue-800 border-b border-blue-200 mb-3 pb-1">Education</h2>
          <p className="text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">{result.education.optimized}</p>
        </section>
      </div>
    )}
    </>
  );
};

export default Home;