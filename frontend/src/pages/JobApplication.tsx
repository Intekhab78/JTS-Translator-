import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, Loader2, CheckCircle, XCircle, Briefcase, ChevronRight, BrainCircuit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';

interface Job {
  _id: string;
  title: string;
  description: string;
}

export const JobApplication: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' } | null>(null);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/job/my-applications/${user._id}`);
      setMyApplications(response.data);
    } catch (err) {
      console.error('Failed to fetch applications', err);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/job/current');
        const jobsList = response.data;
        setJobs(jobsList);
        if (jobsList.length > 0) {
          setSelectedJob(jobsList[0]);
        }
      } catch (err) {
        console.error('Failed to fetch jobs', err);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedJob || !user) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobId', selectedJob._id);
    formData.append('userId', user._id);

    try {
      const response = await axios.post('http://localhost:5000/api/job/apply', formData);
      
      if (response.data.success) {
        if (response.data.isMatch === false) {
          setMessage({ text: response.data.message, type: 'warning' });
        } else {
          setMessage({ text: response.data.message, type: 'success' });
        }
        fetchApplications();
      } else {
        setMessage({ text: response.data.message, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.error || 'Submission failed', type: 'error' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const hasApplied = selectedJob ? myApplications.some(app => app.jobId?._id === selectedJob._id || app.jobId === selectedJob._id) : false;

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen">
        
        {/* Top Banner: Visual / Brand */}
        <div className="relative w-full h-[300px] lg:h-[400px] flex flex-col justify-center px-6 lg:px-12 border-b border-white/5">
          <div className="absolute inset-0 z-0">
            <img 
              src="/images/job_bg.png" 
              alt="Career Growth Network" 
              className="w-full h-full object-cover opacity-60 object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20"></div>
            <div className="absolute inset-0 bg-teal-900/20 mix-blend-overlay"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
                <Briefcase className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Careers
              </span>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight"
            >
              Build the future of <span className="text-teal-400">Communication.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-slate-300 text-lg leading-relaxed max-w-2xl"
            >
              Join our world-class team. Upload your resume and let our AI instantly match your skills to our open positions.
            </motion.p>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full max-w-7xl mx-auto flex flex-col p-6 lg:p-12 relative flex-1">

          {loadingJobs ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-teal-500" />
              <p className="text-slate-500 font-medium">Loading opportunities...</p>
            </div>
          ) : jobs.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
              
              {/* Sidebar List */}
              <div className="lg:col-span-1 space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 ml-1">Open Positions</h3>
                <div className="space-y-2">
                  {jobs.map(j => (
                    <button
                      key={j._id}
                      onClick={() => setSelectedJob(j)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                        selectedJob?._id === j._id 
                          ? 'bg-teal-500/10 border-teal-500/30 text-white shadow-lg shadow-teal-500/5' 
                          : 'bg-slate-900/40 border-white/5 text-slate-400 hover:bg-white/10 hover:border-white/10'
                      }`}
                    >
                      <span className="font-bold text-sm truncate">{j.title}</span>
                      <ChevronRight className={`w-4 h-4 transition-transform shrink-0 ${selectedJob?._id === j._id ? 'translate-x-0 text-teal-400' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Details Area */}
              <div className="lg:col-span-2 space-y-6">
                <AnimatePresence mode="wait">
                  {selectedJob && (
                    <motion.div
                      key={selectedJob._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      <section className="glass-panel p-8 border border-white/10 bg-slate-900/60 rounded-3xl shadow-2xl backdrop-blur-md">
                        <div className="flex justify-between items-start mb-6">
                          <h2 className="text-2xl font-bold text-white tracking-tight">{selectedJob.title}</h2>
                          <span className="px-3 py-1 bg-teal-500/10 text-teal-400 text-[10px] font-bold uppercase rounded-lg border border-teal-500/20">Full-time</span>
                        </div>
                        <div className="prose prose-invert max-w-none whitespace-pre-wrap text-slate-300 leading-relaxed text-sm">
                          {selectedJob.description}
                        </div>
                      </section>

                      <section className="glass-panel p-8 border border-teal-500/20 bg-teal-900/10 rounded-3xl text-center shadow-2xl shadow-teal-500/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[50px]"></div>
                        
                        {hasApplied ? (
                          <div className="relative z-10 flex flex-col items-center justify-center py-8">
                            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4">
                              <CheckCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Application Submitted</h3>
                            <p className="text-slate-400 text-sm mb-6 max-w-sm">You have already submitted your resume for this position. Check your applications dashboard for updates.</p>
                            <button 
                              onClick={() => navigate('/my-applications')}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 flex items-center gap-2"
                            >
                              Go to My Applications <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="mb-6 relative z-10">
                              <h3 className="text-xl font-bold text-white">Apply for this Position</h3>
                              <p className="text-slate-400 text-sm mt-2 text-center mx-auto max-w-sm">Our AI will instantly analyze your resume against the requirements for this role.</p>
                            </div>
                            
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              accept=".pdf,.docx,.txt"
                              className="hidden" 
                              id="resume-upload"
                            />
                            
                            <label 
                              htmlFor="resume-upload"
                              className={`relative z-10 flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                                isUploading 
                                  ? 'border-teal-500/50 bg-teal-500/5 cursor-wait' 
                                  : 'border-slate-700 hover:border-teal-500/50 hover:bg-teal-500/10 bg-slate-900/50'
                              }`}
                            >
                              {isUploading ? (
                                <div className="flex flex-col items-center">
                                  <div className="relative mb-4">
                                     <Loader2 className="w-14 h-14 text-teal-500 animate-spin" />
                                     <FileText className="w-6 h-6 text-teal-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                  </div>
                                  <p className="text-lg font-bold text-white mb-1">Analyzing Resume</p>
                                  <p className="text-xs text-teal-500/70 animate-pulse font-medium">Extracting data & calculating match score...</p>
                                </div>
                              ) : (
                                <>
                                  <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-white/5 shadow-inner">
                                    <UploadCloud className="w-8 h-8 text-teal-500" />
                                  </div>
                                  <p className="text-white font-bold mb-1">Click to upload resume</p>
                                  <p className="text-xs text-slate-500 font-medium">Supports PDF, DOCX, and TXT files</p>
                                </>
                              )}
                            </label>
                          </>
                        )}
                      </section>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-6 flex flex-col items-center justify-center p-6 border border-indigo-500/20 bg-indigo-900/10 hover:bg-indigo-900/20 rounded-3xl text-center shadow-lg relative overflow-hidden group cursor-pointer transition-all"
                        onClick={() => navigate('/my-applications')}
                      >
                         <BrainCircuit className="w-8 h-8 text-indigo-400 mb-3 group-hover:scale-110 transition-transform" />
                         <h4 className="text-white font-bold mb-1">Pending Interviews?</h4>
                         <p className="text-slate-400 text-sm">Check your applications dashboard to complete any pending written interviews.</p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center py-20 px-8 bg-slate-900/40 border border-dashed border-white/10 rounded-3xl max-w-md w-full">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">No Openings</h3>
                <p className="text-slate-400 text-sm">We don't have any active job openings at the moment. Please check back later.</p>
              </div>
            </div>
          )}

          {/* Status Popups */}
          <AnimatePresence>
            {message && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
              >
                <motion.div 
                  initial={{ scale: 0.95, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 20 }}
                  className={`w-full max-w-md p-10 rounded-[2rem] border shadow-2xl backdrop-blur-xl ${
                  message.type === 'success' 
                    ? 'bg-slate-900/90 border-teal-500/30' 
                    : message.type === 'warning'
                    ? 'bg-slate-900/90 border-amber-500/30'
                    : 'bg-slate-900/90 border-red-500/30'
                } text-center`}
                >
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-inner ${
                    message.type === 'success' ? 'bg-teal-500/20 text-teal-400' :
                    message.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {message.type === 'success' ? (
                      <CheckCircle className="w-10 h-10" />
                    ) : message.type === 'warning' ? (
                      <FileText className="w-10 h-10" />
                    ) : (
                      <XCircle className="w-10 h-10" />
                    )}
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-3 ${
                    message.type === 'success' ? 'text-teal-400' :
                    message.type === 'warning' ? 'text-amber-400' :
                    'text-red-400'
                  }`}>
                    {message.type === 'success' ? 'Perfect Match!' : message.type === 'warning' ? 'Application Received' : 'Submission Error'}
                  </h3>
                  
                  <p className="text-slate-300 mb-8 leading-relaxed font-medium">
                    {message.text}
                  </p>
                  
                  <button 
                    onClick={() => setMessage(null)}
                    className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${
                      message.type === 'success'
                        ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-600/20'
                        : message.type === 'warning'
                        ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                        : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20'
                    }`}
                  >
                    Continue
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
};
