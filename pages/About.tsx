import React from 'react';
import { Icons } from '../components/Icons';

const About: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-3xl p-10 shadow-xl shadow-slate-200 border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        
        <div className="w-20 h-20 bg-slate-50 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-inner border border-slate-100">
          <Icons.Resume className="w-10 h-10 text-blue-600" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-slate-900 mb-6">Smart Resume Maker</h1>
        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
          Don't let an ATS bot reject your dream job. We use advanced AI to tailor your resume specifically for the Job Description you want.
        </p>

        <div className="grid md:grid-cols-3 gap-6 text-left mb-10">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Icons.Target className="w-5 h-5 text-blue-500" /> ATS Friendly
            </h3>
            <p className="text-sm text-slate-500">Keywords are naturally integrated to pass automated filters.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Icons.Zap className="w-5 h-5 text-amber-500" /> Impactful
            </h3>
            <p className="text-sm text-slate-500">Weak verbs are replaced with powerful, action-oriented language.</p>
          </div>
           <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
              <Icons.Star className="w-5 h-5 text-purple-500" /> Tailored
            </h3>
            <p className="text-sm text-slate-500">Every bullet point is rewritten to match the specific JD.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
            Powered by Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;