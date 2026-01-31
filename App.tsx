
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Vocabulary from './pages/Vocabulary';
import Revision from './pages/Revision';
import MockInterview from './pages/MockInterview';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
        <Navbar />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/revision" element={<Revision />} />
            <Route path="/mock-interview" element={<MockInterview />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 mt-auto print:hidden">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p className="text-slate-400 text-sm">
              © {new Date().getFullYear()} Sky & Ghost Portal.
            </p>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
