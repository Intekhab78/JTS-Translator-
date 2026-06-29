import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PlanGuardProps {
  children: React.ReactNode;
  feature: 'stream' | 'doc' | 'truth';
  fallbackTitle: string;
  fallbackDescription: string;
}

export const PlanGuard: React.FC<PlanGuardProps> = ({ children, feature, fallbackTitle, fallbackDescription }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hasAccess = user?.plan === 'advanced' || user?.plan === feature;

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden border border-white/5 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center group">
      {/* Blurred background content (simulated) */}
      <div className="absolute inset-0 -z-10 opacity-20 blur-sm overflow-hidden select-none pointer-events-none">
        {children}
      </div>

      <div className="max-w-md animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-indigo-600/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30 group-hover:scale-110 transition-transform duration-500">
          <Lock className="text-indigo-400 w-10 h-10" />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-3">{fallbackTitle}</h3>
        <p className="text-slate-400 mb-8 leading-relaxed">
          {fallbackDescription}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/pricing')}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95"
          >
            Upgrade Plan <Zap className="w-4 h-4 fill-white" />
          </button>
          <button
            onClick={() => navigate('/pricing')}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            View Plans <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-indigo-500/30 rounded-tl-2xl"></div>
      <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-indigo-500/30 rounded-tr-2xl"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-indigo-500/30 rounded-bl-2xl"></div>
      <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-indigo-500/30 rounded-br-2xl"></div>
    </div>
  );
};
