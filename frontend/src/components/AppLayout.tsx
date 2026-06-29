import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Zap, MessageSquare, Briefcase, CreditCard, LogOut, Menu, X, Shield, Globe, HelpCircle, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'JtsStream', path: '/dashboard', icon: <Zap className="w-5 h-5" /> },
    { name: 'DocIntel', path: '/qa', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Careers', path: '/apply', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'My Applications', path: '/my-applications', icon: <FileText className="w-5 h-5" /> },
    { name: 'Pricing', path: '/pricing', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Help', path: '/help', icon: <HelpCircle className="w-5 h-5" /> },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950/80 backdrop-blur-xl border-r border-white/5 p-6 w-64 lg:w-72">
      <div 
        className="flex items-center gap-3 cursor-pointer mb-10 group" 
        onClick={() => navigate('/')}
      >
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
          <Globe className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          Lopy Translator
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                  ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          );
        })}
      </nav>

      {user && (
        <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center gap-3 px-2">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-xl border border-slate-700" />
            ) : (
              <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-xl flex items-center justify-center font-bold border border-indigo-500/30 shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden">
              <div className="text-sm font-bold text-white truncate flex items-center gap-2">
                {user.name}
                {user.plan === 'advanced' && (
                  <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                )}
              </div>
              <div className="text-xs text-slate-500 truncate">{user.email}</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans text-slate-200">
      {/* Abstract Persistent Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="/images/dashboard_bg.png" 
          alt="Abstract Background" 
          className="w-full h-full object-cover opacity-30 mix-blend-screen"
        />
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[100px]"></div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block relative z-10 shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Header & Menu */}
      <div className="lg:hidden absolute top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Globe className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-white">Lopy Translator</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="lg:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-xl pt-20"
          >
            <SidebarContent />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden pt-20 lg:pt-0 custom-scrollbar">
        {children}
      </div>
    </div>
  );
};
