import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Calendar, CheckCircle, XCircle, FileText, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/AppLayout';
import { motion } from 'framer-motion';

export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/job/my-applications/${user._id}`);
        setApplications(response.data);
      } catch (err) {
        console.error('Failed to fetch applications', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [user]);

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        <div className="relative w-full h-[250px] flex flex-col justify-center px-6 lg:px-12 border-b border-white/5">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900"></div>
          </div>
          
          <div className="relative z-10 max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <FileText className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                My Applications
              </span>
            </div>
            <p className="text-slate-300 text-lg">
              Track your job applications and take pending interviews.
            </p>
          </div>
        </div>

        <div className="w-full max-w-5xl mx-auto p-6 lg:p-12 relative flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
              <p className="text-slate-500 font-medium">Loading your applications...</p>
            </div>
          ) : applications.length > 0 ? (
            <div className="space-y-6">
              {applications.map((app) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={app._id} 
                  className="glass-panel p-6 border border-white/10 bg-slate-900/60 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                >
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-white">{app.jobId?.title || 'Unknown Position'}</h3>
                      {app.status === 'accepted' ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase rounded-lg border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Matched
                        </span>
                      ) : app.status === 'rejected' ? (
                        <span className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold uppercase rounded-lg border border-red-500/20 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Mismatched
                        </span>
                      ) : app.status === 'scheduled' ? (
                        <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase rounded-lg border border-indigo-500/20 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Interview Scheduled
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold uppercase rounded-lg border border-white/5">
                          Pending Review
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-400 line-clamp-2">{app.jobId?.description}</p>
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Applied on {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="w-full md:w-auto shrink-0 flex flex-col gap-3">
                    {app.writtenInterview && app.writtenInterview.status === 'pending' && (
                      <button 
                        onClick={() => navigate(`/interview/${app._id}`)}
                        className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 group active:scale-95"
                      >
                        Take Written Interview
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                    {app.writtenInterview && app.writtenInterview.status === 'completed' && (
                      <div className="w-full md:w-auto bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Interview Completed
                      </div>
                    )}
                    {(!app.writtenInterview || !app.writtenInterview.questions || app.writtenInterview.questions.length === 0) && app.status === 'accepted' && (
                      <div className="w-full md:w-auto bg-slate-800 border border-white/5 text-slate-400 px-6 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2">
                        Awaiting next steps
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-8 bg-slate-900/40 border border-dashed border-white/10 rounded-3xl max-w-md w-full mx-auto">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-8 h-8 text-slate-500" />
              </div>
              <h3 className="text-white text-xl font-bold mb-2">No Applications</h3>
              <p className="text-slate-400 text-sm mb-6">You haven't applied to any jobs yet.</p>
              <button 
                onClick={() => navigate('/apply')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95"
              >
                Browse Careers
              </button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
