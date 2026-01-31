import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import { OptimizationMode, ResumeAnalysisResult } from '../types';
import { analyzeResume } from '../services/geminiService';
import AtsScoreCard from '../components/AtsScoreCard';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
  const [mode, setMode] = useState<OptimizationMode>(OptimizationMode.IMPROVE);
  const [identity, setIdentity] = useState<'Sky' | 'Ghost' | null>(null);

  const handleGenerate = async () => {
    if (!jd.trim() || !resume.trim()) return;
    if (mode === OptimizationMode.INTERVIEW && !identity) {
      alert("Please select your identity (Sky or Ghost) for interview mode.");
      return;
    }
    setLoading(true);
    try {
      const data = await analyzeResume(resume, jd, mode, identity || undefined);
      setResult(data);
      setStep(2);
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const startMockInterview = () => {
    navigate('/mock-interview', { 
      state: { 
        identity: identity || 'Sky', 
        interviewer: identity === 'Sky' ? 'Ghost' : 'Sky',
        resumeData: result
      } 
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (step === 1) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
            Resume <span className="text-blue-600">Optimizer</span>
          </h1>
          <p className="text-lg text-slate-500">
            Tailor your professional story for ATS bots or Human interviewers.
          </p>
        </header>

        <div className="bg-white p-2 rounded-2xl border border-slate-200 mb-8 flex gap-1 shadow-sm max-w-2xl mx-auto">
          {Object.values(OptimizationMode).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${mode === m ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === OptimizationMode.INTERVIEW && (
          <div className="mb-8 p-8 bg-indigo-50 rounded-3xl border-2 border-indigo-100 shadow-sm text-center animate-in zoom-in duration-300">
            <h3 className="text-xl font-black text-indigo-900 mb-2 uppercase tracking-tight">Step 1: Who are you?</h3>
            <p className="text-indigo-600 mb-6 font-medium">Select your portal identity to assign your interviewer.</p>
            <div className="flex justify-center gap-8">
              <button 
                onClick={() => setIdentity('Sky')}
                className={`group flex flex-col items-center p-6 rounded-2xl border-4 transition-all w-40 bg-white ${identity === 'Sky' ? 'border-blue-500 shadow-xl scale-105' : 'border-white hover:border-blue-100 shadow-sm'}`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${identity === 'Sky' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                  <Icons.User className="w-8 h-8" />
                </div>
                <span className="font-black text-slate-800 text-lg">Sky</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">The Candidate</span>
              </button>
              <button 
                onClick={() => setIdentity('Ghost')}
                className={`group flex flex-col items-center p-6 rounded-2xl border-4 transition-all w-40 bg-white ${identity === 'Ghost' ? 'border-indigo-500 shadow-xl scale-105' : 'border-white hover:border-indigo-100 shadow-sm'}`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${identity === 'Ghost' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'}`}>
                  <Icons.User className="w-8 h-8" />
                </div>
                <span className="font-black text-slate-800 text-lg">Ghost</span>
                <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">The Candidate</span>
              </button>
            </div>
            
            {identity && (
              <div className="mt-8 flex items-center justify-center gap-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-indigo-200 shadow-sm">
                  <span className="text-xs font-bold text-slate-400">Candidate:</span>
                  <span className="text-sm font-black text-blue-600">{identity}</span>
                </div>
                <Icons.ArrowRight className="w-4 h-4 text-indigo-300" />
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-indigo-200 shadow-sm">
                  <span className="text-xs font-bold text-slate-400">Interviewer:</span>
                  <span className="text-sm font-black text-indigo-600">{identity === 'Sky' ? 'Ghost' : 'Sky'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
              <Icons.Job className="w-4 h-4 text-blue-500" />
              Target Job Description
            </label>
            <textarea
              className="w-full h-64 p-5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 resize-none shadow-sm text-sm leading-relaxed"
              placeholder="Paste the JD here. Be specific for better results..."
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 flex items-center gap-2 uppercase tracking-wider">
              <Icons.Resume className="w-4 h-4 text-purple-500" />
              Your Current Resume
            </label>
            <textarea
              className="w-full h-64 p-5 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 resize-none shadow-sm text-sm leading-relaxed"
              placeholder="Paste your current resume content here..."
              value={resume}
              onChange={(e) => setResume(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGenerate}
            disabled={loading || !jd || !resume || (mode === OptimizationMode.INTERVIEW && !identity)}
            className="group flex items-center gap-3 px-12 py-4 rounded-2xl font-black text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0"
          >
            {loading ? <Icons.Refresh className="animate-spin w-5 h-5" /> : <Icons.Magic className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
            {loading ? "Optimizing Story..." : "Generate Interview Ready Resume"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8 no-print">
        <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 transition-colors bg-white rounded-xl border border-slate-200 shadow-sm">
          <Icons.Close className="w-4 h-4" /> Exit Editor
        </button>
        <div className="flex gap-3">
          {mode === OptimizationMode.INTERVIEW && (
             <button 
               onClick={startMockInterview}
               className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
             >
               <Icons.Mic className="w-4 h-4"/> Launch Voice Mock
             </button>
          )}
          <button onClick={() => window.print()} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-slate-800 transition-all active:scale-95">
            <Icons.Download className="w-4 h-4"/> Export PDF
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {result && <AtsScoreCard analysis={result.atsAnalysis} />}
          
          {mode === OptimizationMode.INTERVIEW && (
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white">
                <Icons.UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-400 uppercase">Current Profile</p>
                <p className="text-sm font-black text-blue-900">{identity}</p>
              </div>
            </div>
          )}

          {mode === OptimizationMode.INTERVIEW && result?.interviewerNotes && (
            <div className="p-6 bg-slate-900 text-white rounded-3xl shadow-xl border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Icons.Message className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black">{result.interviewerNotes.interviewerName}'s Notes</h3>
                  <p className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">Confidential</p>
                </div>
              </div>
              <div className="space-y-6 text-sm">
                <div>
                  <p className="text-indigo-400 font-bold uppercase text-[10px] mb-3 tracking-widest border-b border-white/10 pb-2">Targeted Questions</p>
                  <ul className="space-y-3">
                    {result.interviewerNotes.targetedQuestions.map((q, i) => (
                      <li key={i} className="flex gap-2 text-slate-300 leading-relaxed">
                        <span className="text-indigo-500 font-black shrink-0">{i+1}.</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-indigo-400 font-bold uppercase text-[10px] mb-2 tracking-widest">Behavioral Deep-Dive</p>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 italic text-slate-400">
                    "{result.interviewerNotes.behavioralQuestion}"
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-9 space-y-8">
          <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-8 py-5 border-b flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-tight">
                {mode === OptimizationMode.INTERVIEW ? "Pitch: Tell Me About Yourself" : "Professional Summary"}
              </h3>
              <button 
                onClick={() => copyToClipboard(result?.summary.optimized || '')}
                className="p-2 hover:bg-white rounded-lg transition-colors group"
              >
                <Icons.Layout className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </button>
            </div>
            <div className="p-8">
              <p className="text-base text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{result?.summary.optimized}</p>
              {result?.summary.feedback && (
                <div className="mt-6 p-4 bg-blue-50 rounded-2xl text-xs text-blue-800 border border-blue-100 flex gap-3">
                  <Icons.Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{result.summary.feedback}</span>
                </div>
              )}
            </div>
          </section>

          {mode === OptimizationMode.INTERVIEW && result?.problemSolving && (
            <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm border-l-8 border-l-amber-500">
               <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 uppercase tracking-tight">
                 <Icons.Star className="w-6 h-6 text-amber-500" /> 
                 Problem Solving Highlights
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {result.problemSolving.map((skill, i) => (
                   <div key={i} className="px-4 py-3 bg-amber-50 text-amber-900 border border-amber-100 rounded-2xl text-sm font-bold flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                     {skill}
                   </div>
                 ))}
               </div>
            </section>
          )}

          <section className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full" />
              Experience Optimization
            </h3>
            {result?.experience.map((exp, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:border-slate-300 transition-colors">
                <div className="bg-slate-50 px-8 py-4 border-b flex justify-between items-center">
                  <span className="font-black text-slate-800">{exp.title}</span>
                  {exp.hook && (
                    <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full uppercase tracking-widest border border-purple-200">
                      Discussion Hook: {exp.hook}
                    </span>
                  )}
                </div>
                <div className="p-8">
                  {exp.star ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { k: 's', l: 'Situation', c: 'blue' },
                        { k: 't', l: 'Task', c: 'indigo' },
                        { k: 'a', l: 'Action', c: 'purple' },
                        { k: 'r', l: 'Result', c: 'green' }
                      ].map(({ k, l, c }) => (
                        <div key={k} className={`p-5 rounded-2xl border-l-4 border-${c}-500 bg-${c}-50/30`}>
                          <p className={`text-[10px] font-black text-${c}-500 uppercase tracking-widest mb-2`}>{l}</p>
                          <p className="text-sm text-slate-700 leading-relaxed font-medium">{(exp.star as any)[k]}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 whitespace-pre-wrap font-medium leading-relaxed">{exp.optimized}</p>
                  )}
                </div>
              </div>
            ))}
          </section>

          <div className="text-center py-10 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl text-white shadow-2xl">
            <Icons.Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h4 className="text-xl font-black uppercase tracking-tight">This resume is optimized for confident interviews.</h4>
            <p className="text-slate-400 text-sm mt-2 font-medium">Ready to showcase the best version of your professional journey.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;