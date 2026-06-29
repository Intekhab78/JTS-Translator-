import React from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '../components/AppLayout';
import { HelpCircle, Zap, MessageSquare, Briefcase, CreditCard, Shield } from 'lucide-react';

export const Help: React.FC = () => {
  const features = [
    {
      id: 'jtsstream',
      title: 'JtsStream (Real-time Translation)',
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      blobClass: 'bg-emerald-500/5 group-hover:bg-emerald-500/10',
      badgeClass: 'bg-emerald-500/20 text-emerald-400',
      description: 'Experience seamless communication across languages. Connect to our WebSocket server to transcribe and translate audio in real-time. Features include language auto-detection, customizable dialects, and a low-latency streaming pipeline.',
      points: [
        'Select your source and target languages on the Dashboard.',
        'Click "Start Session" to begin streaming audio from your microphone.',
        'View real-time transcripts and translations instantly.',
      ]
    },
    {
      id: 'docintel',
      title: 'DocIntel (Document Intelligence)',
      icon: <MessageSquare className="w-6 h-6 text-indigo-400" />,
      blobClass: 'bg-indigo-500/5 group-hover:bg-indigo-500/10',
      badgeClass: 'bg-indigo-500/20 text-indigo-400',
      description: 'Upload your documents and let our AI extract insights, summarize content, and answer your specific questions contextually.',
      points: [
        'Navigate to DocIntel and upload a PDF, DOCX, or TXT file.',
        'Wait a moment while the AI analyzes the document structure.',
        'Chat with your document in the interactive Q&A interface.',
      ]
    },
    {
      id: 'careers',
      title: 'AI-Powered Careers',
      icon: <Briefcase className="w-6 h-6 text-teal-400" />,
      blobClass: 'bg-teal-500/5 group-hover:bg-teal-500/10',
      badgeClass: 'bg-teal-500/20 text-teal-400',
      description: 'Our automated job application platform uses AI to match candidate resumes with job descriptions instantly.',
      points: [
        'Browse open positions on the Careers page.',
        'Upload your resume.',
        'Our system will instantly calculate a match score and give you feedback.',
      ]
    },
    {
      id: 'pricing',
      title: 'Plans & Pricing',
      icon: <CreditCard className="w-6 h-6 text-amber-400" />,
      blobClass: 'bg-amber-500/5 group-hover:bg-amber-500/10',
      badgeClass: 'bg-amber-500/20 text-amber-400',
      description: 'Upgrade to Advanced or Pro tiers for higher translation limits, priority support, and larger document analysis capacities.',
      points: [
        'Go to the Pricing page to compare plans.',
        'Secure checkout through our integrated payment provider.',
        'Your account limits update automatically upon success.',
      ]
    }
  ];

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen pb-12">
        {/* Header Banner */}
        <div className="relative w-full h-[250px] lg:h-[300px] flex flex-col justify-center px-6 lg:px-12 border-b border-white/5 overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
             <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/3"></div>
          </div>
          
          <div className="relative z-10 max-w-5xl mx-auto w-full text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/50 border border-white/10"
            >
              <HelpCircle className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight"
            >
              How can we help?
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto"
            >
              Explore our comprehensive guide to understand the features, tools, and capabilities of the platform.
            </motion.p>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full max-w-5xl mx-auto p-6 lg:p-12 relative flex-1 space-y-10">
          {features.map((feature, index) => (
            <motion.div 
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-panel p-8 md:p-10 rounded-3xl bg-slate-900/60 border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors shadow-2xl"
            >
              <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] transition-colors ${feature.blobClass}`}></div>
              
              <div className="flex flex-col md:flex-row gap-8 relative z-10">
                <div className="shrink-0">
                  <div className={`w-14 h-14 bg-slate-950 rounded-2xl border border-white/10 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-3">{feature.title}</h2>
                  <p className="text-slate-300 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  
                  <div className="space-y-4 bg-slate-950/40 p-6 rounded-2xl border border-white/5">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" /> How to use it
                    </h4>
                    <ul className="space-y-3">
                      {feature.points.map((point, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-slate-300 font-medium">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0 text-[10px] font-bold shadow-sm ${feature.badgeClass}`}>
                            {i + 1}
                          </span>
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          
          {/* Support Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center py-12 px-6 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 mt-12"
          >
            <Shield className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Need more assistance?</h3>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Our support team is available 24/7 to help you with technical issues or enterprise deployments.
            </p>
            <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95">
              Contact Support
            </button>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};
