import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Send, ChevronLeft, CheckCircle, BrainCircuit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AppLayout } from '../components/AppLayout';
import { motion } from 'framer-motion';

export const TakeInterview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplication = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`http://localhost:5000/api/job/my-applications/${user._id}`);
        const app = response.data.find((a: any) => a._id === id);
        if (app && app.writtenInterview && app.writtenInterview.questions) {
          setApplication(app);
          setAnswers(new Array(app.writtenInterview.questions.length).fill(''));
        } else {
          // If no questions or not found
          navigate('/my-applications');
        }
      } catch (err) {
        console.error('Failed to fetch application', err);
        navigate('/my-applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id, user, navigate]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    // Basic validation
    if (answers.some(a => a.trim() === '')) {
      alert("Please provide an answer for all questions.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`http://localhost:5000/api/job/applications/${id}/submit-interview`, {
        answers
      });
      setSuccess(true);
    } catch (err) {
      console.error('Submit failed', err);
      alert('Failed to submit interview. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 h-full min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
          <p className="text-slate-500 font-medium">Loading your interview...</p>
        </div>
      </AppLayout>
    );
  }

  if (success) {
    return (
      <AppLayout>
        <div className="flex-1 flex flex-col items-center justify-center h-full min-h-screen p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel p-10 max-w-lg w-full text-center border border-emerald-500/30 bg-emerald-900/10 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px]"></div>
            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Interview Submitted!</h2>
            <p className="text-slate-300 mb-8 leading-relaxed">
              Your responses have been saved and sent to the recruitment team for review. We'll be in touch soon.
            </p>
            <button 
              onClick={() => navigate('/my-applications')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 w-full"
            >
              Back to My Applications
            </button>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen pb-20">
        <div className="relative w-full h-[250px] flex flex-col justify-center px-6 lg:px-12 border-b border-white/5">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/80 via-slate-950 to-slate-900/80"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto w-full">
            <button 
              onClick={() => navigate('/my-applications')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold mb-6 w-fit"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Applications
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <BrainCircuit className="text-indigo-400 w-6 h-6" />
              </div>
              <span className="text-3xl font-bold tracking-tight text-white">
                Written Interview
              </span>
            </div>
            <p className="text-slate-300 text-lg flex items-center gap-2">
              <span className="text-indigo-400 font-bold">{application.jobId?.title}</span> Position
            </p>
          </div>
        </div>

        <div className="w-full max-w-4xl mx-auto p-6 lg:p-8 relative flex-1 space-y-8 -mt-6 z-20">
          {application.writtenInterview.questions.map((q: string, idx: number) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="glass-panel p-8 border border-white/10 bg-slate-900/80 rounded-3xl shadow-xl backdrop-blur-xl relative overflow-hidden group focus-within:border-indigo-500/50 focus-within:shadow-indigo-500/10 transition-all"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-50 group-focus-within:opacity-100 transition-opacity"></div>
              
              <div className="flex gap-4 mb-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-500/20">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-bold text-white leading-relaxed pt-1">
                  {q}
                </h3>
              </div>
              
              <div className="pl-12">
                <textarea 
                  value={answers[idx]}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  placeholder="Type your answer here..."
                  rows={5}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all resize-y shadow-inner text-sm leading-relaxed"
                />
              </div>
            </motion.div>
          ))}

          <div className="flex justify-end pt-4">
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 active:scale-95 text-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  Submit Interview <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
