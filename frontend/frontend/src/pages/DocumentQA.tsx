import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AskQuestionPanel } from '../components/AskQuestionPanel';
import { PlanGuard } from '../components/PlanGuard';
import { AppLayout } from '../components/AppLayout';

export const DocumentQA: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 flex flex-col h-full min-h-[calc(100vh-80px)] lg:min-h-screen">
        
        {/* Header */}
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Document Intelligence</h1>
            <p className="text-slate-400">Upload any PDF, DOCX or TXT to start a conversation with your data.</p>
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="hidden sm:flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors py-2 px-4 bg-slate-900/50 rounded-lg border border-white/5 hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Stream
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col w-full h-full">
            <div className="flex-1 min-h-[600px] h-full w-full relative z-10 glass-panel rounded-3xl border border-white/10 shadow-2xl bg-slate-900/40 backdrop-blur-md overflow-hidden">
              <AskQuestionPanel />
            </div>
        </main>
      </div>
    </AppLayout>
  );
};
