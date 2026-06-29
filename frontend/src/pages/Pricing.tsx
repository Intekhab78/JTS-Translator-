import React, { useState } from 'react';
import { Check, Star, ArrowLeft, Loader, Zap, Shield, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/AppLayout';

export const Pricing: React.FC = () => {
  const { user, updateUserPlan } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'bundled' | 'single'>('bundled');

  const singleFeatures = [
    {
      id: 'stream',
      title: 'Stream Pro',
      price: '$1',
      description: 'Focused live translation',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      features: ['Real-time Translation', 'Voice Analysis', 'Priority Streaming'],
      bgColor: 'bg-amber-900/20',
      borderColor: 'border-amber-500/30',
      accentColor: 'text-amber-400',
      shadowColor: 'shadow-amber-500/10'
    },
    {
      id: 'doc',
      title: 'Doc Analyst',
      price: '$1',
      description: 'Focused document QA',
      icon: <MessageSquare className="w-5 h-5 text-emerald-400" />,
      features: ['Document QA', 'PDF/DOCX Analysis', 'Instant Insights'],
      bgColor: 'bg-emerald-900/20',
      borderColor: 'border-emerald-500/30',
      accentColor: 'text-emerald-400',
      shadowColor: 'shadow-emerald-500/10'
    },
    {
      id: 'truth',
      title: 'Truth Guard',
      price: '$1',
      description: 'Focused fact-checking',
      icon: <Shield className="w-5 h-5 text-indigo-400" />,
      features: ['Advanced Fact-Checking', 'Real-time Verification', 'AI Reliability'],
      bgColor: 'bg-indigo-900/20',
      borderColor: 'border-indigo-500/30',
      accentColor: 'text-indigo-400',
      shadowColor: 'shadow-indigo-500/10'
    }
  ];

  const handlePurchase = async (planId: string = 'advanced') => {
    setIsProcessing(true);
    try {
      const response = await axios.post('http://localhost:5000/api/payment/simulate-purchase', {
        plan: planId
      });
      updateUserPlan(response.data.plan);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Purchase failed', error);
      setIsProcessing(false);
      alert('Failed to process payment. Please try again.');
    }
  };

  return (
    <AppLayout>
      <div className="relative min-h-screen py-12 px-4 md:px-8">
        {/* Abstract Background for Pricing Content Area */}
        <div className="absolute inset-0 z-0 rounded-[3rem] m-4 overflow-hidden hidden lg:block border border-white/5 shadow-2xl">
          <img 
            src="/images/pricing_bg.png" 
            alt="Pricing Premium Background" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10 pt-8">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">Upgrade Your Plan</h1>
            <p className="text-slate-400 text-lg">Unlock the full power of the Lopy Translator AI engine</p>
          </header>

          {/* Current Plan Banner */}
          {user && (
            <div className="flex justify-center mb-12">
              <div className="px-6 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-3 shadow-lg shadow-indigo-500/5 backdrop-blur-md">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
                <span className="text-sm font-medium text-slate-300">
                  Current Plan: <span className="text-indigo-400 font-bold uppercase tracking-wider">{user.plan || 'Basic'}</span>
                </span>
              </div>
            </div>
          )}

          {/* Feature Filter Toggle */}
          <div className="flex justify-center mb-16">
            <div className="bg-slate-900/50 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 flex items-center gap-1 relative shadow-2xl">
              <motion.div
                layoutId="activeTabBg"
                className="absolute h-[calc(100%-12px)] bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30"
                initial={false}
                animate={{
                  left: activeTab === 'bundled' ? 6 : '50%',
                  width: 'calc(50% - 9px)'
                }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
              <button
                onClick={() => setActiveTab('bundled')}
                className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'bundled' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bundled Plans
              </button>
              <button
                onClick={() => setActiveTab('single')}
                className={`relative z-10 px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'single' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Single Features
              </button>
            </div>
          </div>

          {/* Pricing Cards Container */}
          <AnimatePresence mode="wait">
            {activeTab === 'bundled' ? (
              <motion.div 
                key="bundled"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
              >
            
            {/* Basic Plan */}
            <div className="glass-panel p-10 rounded-[2.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-xl flex flex-col group hover:border-white/20 transition-all shadow-xl">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-300 mb-2">Basic</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white">$0</span>
                  <span className="text-slate-500 font-medium">/ forever</span>
                </div>
              </div>
              
              <ul className="space-y-5 mb-10 flex-1 text-slate-300">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-400" /> 
                  </div>
                  Standard Translation Models
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-400" /> 
                  </div>
                  Basic Text Processing
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-400" /> 
                  </div>
                  Standard Speed
                </li>
                <li className="flex items-center gap-3 opacity-40">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                    <Check className="w-4 h-4 text-slate-500" /> 
                  </div>
                  Advanced Fact-Checking
                </li>
                <li className="flex items-center gap-3 opacity-40">
                  <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center">
                    <Check className="w-4 h-4 text-slate-500" /> 
                  </div>
                  Priority Processing
                </li>
              </ul>

              <button 
                disabled
                className="w-full py-4 rounded-2xl font-bold border border-slate-700 bg-slate-800/50 text-slate-500 cursor-not-allowed"
              >
                {user?.plan === 'basic' || !user?.plan ? 'Current Plan' : 'Included'}
              </button>
            </div>

            {/* Advanced Plan */}
            <div className="glass-panel p-10 rounded-[2.5rem] border border-indigo-500/50 bg-indigo-900/20 backdrop-blur-xl flex flex-col relative transform md:-translate-y-6 shadow-2xl shadow-indigo-500/10 hover:shadow-indigo-500/20 hover:scale-[1.02] transition-all">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold uppercase tracking-wider py-2 px-6 rounded-full shadow-lg shadow-indigo-500/30">
                  Most Popular
                </span>
              </div>

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-indigo-300 mb-2 flex items-center gap-2">
                  <Zap className="w-6 h-6 fill-indigo-300" /> Advanced
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold text-white">$3</span>
                  <span className="text-indigo-400/80 font-medium">/ month</span>
                </div>
              </div>
              
              <ul className="space-y-5 mb-10 flex-1 text-slate-100">
                <li className="flex items-center gap-3 font-medium">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 
                  </div>
                  Premium Translation Models
                </li>
                <li className="flex items-center gap-3 font-medium">
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 
                  </div>
                  Advanced Fact-Checking
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-indigo-400" /> 
                  </div>
                  Real-time Streaming
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-indigo-400" /> 
                  </div>
                  Priority Processing Queue
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-indigo-400" /> 
                  </div>
                  24/7 Priority Support
                </li>
              </ul>

              {user?.plan === 'advanced' ? (
                <button 
                  disabled
                  className="w-full py-4 rounded-2xl font-bold bg-indigo-600/30 text-indigo-300 cursor-not-allowed border border-indigo-500/30 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> Active Subscription
                </button>
              ) : (
                <button 
                  onClick={() => handlePurchase('advanced')}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>
                      Purchase Advanced <ArrowLeft className="w-4 h-4 rotate-180" />
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.div>
            ) : (
              <motion.div 
                key="single"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto"
              >
                {singleFeatures.map((plan) => (
                  <div key={plan.id} className={`glass-panel p-8 rounded-[2rem] border ${plan.borderColor} ${plan.bgColor} backdrop-blur-xl flex flex-col group hover:-translate-y-2 hover:shadow-2xl ${plan.shadowColor} transition-all`}>
                    <div className="mb-8">
                      <div className={`w-14 h-14 bg-slate-900/80 rounded-2xl flex items-center justify-center mb-6 border border-white/5 shadow-inner group-hover:scale-110 transition-transform`}>
                        {plan.icon}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{plan.title}</h3>
                      <p className="text-slate-400 text-sm mb-4 h-10">{plan.description}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                        <span className="text-slate-500 text-sm font-medium">/ month</span>
                      </div>
                    </div>
                    
                    <ul className="space-y-4 mb-10 flex-1 text-slate-300">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm">
                          <Check className={`w-4 h-4 ${plan.accentColor}`} /> {feat}
                        </li>
                      ))}
                    </ul>

                    {user?.plan === 'advanced' || user?.plan === plan.id ? (
                      <button 
                        disabled
                        className="w-full py-4 rounded-xl text-sm font-bold bg-white/5 text-slate-400 border border-white/10 cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" /> 
                        {user?.plan === 'advanced' ? 'Included in Pro' : 'Active'}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePurchase(plan.id)}
                        disabled={isProcessing}
                        className={`w-full py-4 rounded-xl text-sm font-bold bg-slate-800 hover:bg-slate-700 text-white border border-white/10 transition-all shadow-lg active:scale-95`}
                      >
                        Get {plan.title}
                      </button>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
};
