import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface Job {
  _id: string;
  title: string;
  description: string;
}
import { 
  Globe, 
  Mic, 
  MessageSquare, 
  Shield, 
  Zap, 
  Send,
  Share2,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/job/current');
        setJobs(response.data);
      } catch (err) {
        console.error('Failed to fetch jobs', err);
      }
    };
    fetchJobs();
  }, []);

  const features = [
    {
      icon: <Globe className="w-6 h-6 text-emerald-400" />,
      title: "Real-time Translation",
      description: "Break language barriers instantly with our state-of-the-art translation engine supporting 50+ languages."
    },
    {
      icon: <Mic className="w-6 h-6 text-indigo-400" />,
      title: "Voice Analysis",
      description: "Crystal clear speech-to-text transcription for meetings, lectures, and live events."
    },
    {
      icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
      title: "Document Intelligence",
      description: "Upload resumes or documents and get instant AI-driven insights and interactive Q&A."
    },
    {
      icon: <Shield className="w-6 h-6 text-purple-400" />,
      title: "Fact Checking",
      description: "Integrated AI fact-checking ensures your communications are accurate and reliable in real-time."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-emerald-500/30 font-sans overflow-x-hidden">
      
      {/* Premium Hero Background */}
      <div className="absolute inset-0 z-0 h-[800px] lg:h-[900px] w-full">
        <img 
          src="/images/home_bg.png" 
          alt="AI Global Communication" 
          className="w-full h-full object-cover object-top opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto backdrop-blur-sm">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform">
            <Globe className="text-emerald-400 w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Lopy Translator
          </span>
        </div>
        <div className="flex items-center gap-4 lg:gap-6">
          {user ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 backdrop-blur-md rounded-xl border border-white/10">
                <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center font-bold border border-emerald-500/30">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold text-white">{user.name}</span>
              </div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 bg-white text-slate-950 rounded-xl text-sm font-bold hover:bg-slate-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] active:scale-95 flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Dashboard
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                className="text-sm font-bold hover:text-white text-slate-300 transition-colors hidden sm:block"
              >
                Sign In
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 flex items-center gap-2"
              >
                Get Started <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 lg:pt-32 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8 inline-block shadow-[0_0_15px_rgba(16,185,129,0.2)] backdrop-blur-md">
              Next-Gen AI Communication
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] text-white">
              Communicate Without <br className="hidden md:block" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400">
                Boundaries.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-slate-300 text-lg md:text-xl mb-12 leading-relaxed font-medium">
              The premium all-in-one platform for real-time translation, voice transcription, 
              and intelligent document analysis. Designed for global impact.
            </p>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 group active:scale-95"
            >
              <Zap className="w-5 h-5 fill-emerald-300" /> Start Streaming
            </button>
            <button 
              onClick={() => navigate('/qa')}
              className="w-full sm:w-auto px-8 py-4 bg-slate-900/60 backdrop-blur-xl border border-white/10 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 group active:scale-95"
            >
              <MessageSquare className="w-5 h-5 text-slate-300" /> Try DocQA
            </button>
          </motion.div>
        </div>

        {/* Feature Grid */}
        <div className="mt-40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-panel p-8 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/5 group hover:border-emerald-500/30 hover:bg-slate-900/60 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all cursor-default"
            >
              <div className="w-14 h-14 bg-slate-800/80 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-white/5 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm font-medium">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Careers Section - Split Screen Vibe */}
        <div className="mt-40 rounded-[3rem] overflow-hidden border border-white/10 relative shadow-2xl flex flex-col lg:flex-row">
          <div className="absolute inset-0 z-0">
             <img src="/images/job_bg.png" alt="Careers Background" className="w-full h-full object-cover opacity-30" />
             <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>
          </div>

          <div className="relative z-10 w-full lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Zap className="text-emerald-400 w-6 h-6 fill-emerald-400/50" />
              </div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight">Join Our Mission</h2>
            </div>
            <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-md">
              We're looking for passionate individuals to help us build the future of AI-powered communication. 
              Explore our current openings and join a world-class team.
            </p>
            <button 
              onClick={() => navigate('/apply')}
              className="w-full sm:w-max px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 flex items-center justify-center gap-2"
            >
              Browse Careers <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="relative z-10 w-full lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center bg-slate-900/40">
            <div className="space-y-6">
              {jobs.length > 0 ? (
                jobs.slice(0, 2).map((job, index) => (
                  <div key={job._id} className={`p-8 bg-slate-950/60 rounded-3xl border border-white/5 transition-colors group ${index % 2 === 0 ? 'hover:border-emerald-500/30' : 'hover:border-indigo-500/30'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className={`text-white font-bold text-xl transition-colors ${index % 2 === 0 ? 'group-hover:text-emerald-400' : 'group-hover:text-indigo-400'}`}>
                        {job.title}
                      </h3>
                      <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-lg border ${index % 2 === 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>Full-time</span>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 line-clamp-2">
                      {job.description}
                    </p>
                    <button onClick={() => navigate('/apply')} className={`font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all ${index % 2 === 0 ? 'text-emerald-400' : 'text-indigo-400'}`}>
                      Apply Now <Send className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-8 bg-slate-950/60 rounded-3xl border border-white/5 text-center">
                  <p className="text-slate-400">No open positions at the moment. Check back later!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 relative z-10 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
              <Globe className="text-emerald-400 w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-white">Lopy Translator</span>
          </div>
          
          <div className="flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all">
              <Share2 className="w-5 h-5 text-slate-300" />
            </a>
            <a href="#" className="p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all">
              <Globe className="w-5 h-5 text-slate-300" />
            </a>
          </div>
        </div>
        <div className="text-center mt-12 text-xs font-medium text-slate-600 uppercase tracking-widest">
          © {new Date().getFullYear()} Lopy Translator. Built for the Future.
        </div>
      </footer>
    </div>
  );
};
