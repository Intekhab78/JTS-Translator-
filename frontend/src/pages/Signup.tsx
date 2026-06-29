import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, User, ArrowRight, Loader, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
      });
      login(response.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await axios.post(`${API_URL}/auth/google`, {
        token: credentialResponse.credential,
      });
      
      login(response.data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Google registration failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google registration was unsuccessful');
  };

  return (
    <div className="min-h-screen flex flex-row-reverse bg-slate-950 overflow-hidden">
      
      {/* Right Panel - Visual/Brand (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/signup_bg.png" 
            alt="Abstract Global Network" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          <div className="absolute inset-0 bg-pink-900/20 mix-blend-overlay"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-end gap-3">
          <span className="text-2xl font-bold tracking-tight text-white">
            Lopy Translator
          </span>
          <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Globe className="text-white w-6 h-6" />
          </div>
        </div>

        <div className="relative z-10 max-w-lg ml-auto text-right">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-extrabold text-white mb-6 leading-tight"
          >
            Break down <br />
            <span className="text-pink-400">language barriers.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-slate-300 text-lg leading-relaxed"
          >
            Join thousands of users who communicate effortlessly across the globe with our cutting-edge AI technology.
          </motion.p>
        </div>
      </div>

      {/* Left Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        {/* Mobile Background */}
        <div className="absolute inset-0 z-0 lg:hidden">
          <img 
            src="/images/signup_bg.png" 
            alt="Abstract Global Network" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md relative z-10"
        >
          <div className="mb-10 lg:hidden text-center">
            <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/30">
              <Globe className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Start your translation journey today</p>
          </div>

          <div className="hidden lg:block mb-10">
            <h2 className="text-4xl font-bold text-white mb-3">Create Account</h2>
            <p className="text-slate-400 font-medium">Start your translation journey today</p>
          </div>

          <div className="glass-panel p-8 md:p-10 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-xl bg-slate-900/60 lg:bg-slate-900/40">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium mb-6 flex items-center justify-center text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-500 group-focus-within:text-pink-400 transition-colors" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all outline-none placeholder:text-slate-600"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-pink-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all outline-none placeholder:text-slate-600"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-pink-400 transition-colors" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all outline-none placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
                >
                  {isLoading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative px-4 bg-transparent text-sm text-slate-500 font-medium">
                Or sign up with
              </div>
            </div>

            <div className="mt-8 flex justify-center w-full">
              <div className="w-full flex justify-center [&>div]:w-full [&>div>div]:!w-full drop-shadow-md">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="outline"
                  size="large"
                  shape="rectangular"
                  width="340"
                />
              </div>
            </div>
            
            <div className="mt-8 text-center text-slate-400 font-medium border-t border-white/5 pt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-pink-400 hover:text-pink-300 transition-colors font-bold">
                Sign in here
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
