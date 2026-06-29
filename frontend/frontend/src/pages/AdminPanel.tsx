import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Users, Mail, Calendar, LogOut, ArrowLeft, Loader, CheckCircle, XCircle, FileText, Download, Plus, Briefcase, BrainCircuit, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface UserData {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  googleId?: string;
  createdAt: string;
  plan: string;
}

interface JobData {
  _id: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

interface ApplicationData {
  _id: string;
  userId: { name: string; email: string };
  jobId: { title: string };
  matchScore: number;
  isMatch: boolean;
  reason: string;
  status: string;
  createdAt: string;
  resumeText: string;
  interviewDate?: string;
  interviewTime?: string;
  interviewMode?: 'online' | 'offline';
  interviewLocation?: string;
  writtenInterview?: {
    questions: string[];
    answers: string[];
    status: string;
    completedAt?: string;
    evaluation?: {
      answerScores: string[];
      overallScore: number;
    };
  };
}

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'job' | 'apps'>('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedResume, setSelectedResume] = useState<string | null>(null);
  const [showAddJob, setShowAddJob] = useState(false);
  const [schedulingAppId, setSchedulingAppId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleMode, setScheduleMode] = useState<'online' | 'offline'>('online');
  const [scheduleLocation, setScheduleLocation] = useState('');
  const [scheduleMessage, setScheduleMessage] = useState('');
  const [messageEdited, setMessageEdited] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<ApplicationData | null>(null);
  const [generatingInterviewId, setGeneratingInterviewId] = useState<string | null>(null);
  const [appSearchTerm, setAppSearchTerm] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    if (schedulingAppId && !messageEdited) {
       const app = applications.find(a => a._id === schedulingAppId);
       if (app) {
         const modeStr = scheduleMode === 'online' ? 'Online Video Call' : 'In-Person / Offline';
         const locStr = scheduleMode === 'online' ? `Meeting Link: ${scheduleLocation || '[Link]'}` : `Location: ${scheduleLocation || '[Address]'}`;
         const dateStr = scheduleDate ? new Date(scheduleDate).toLocaleDateString() : '[Date]';
         const timeStr = scheduleTime || '[Time]';
         
         setScheduleMessage(`Dear ${app.userId?.name || 'Candidate'},\n\nWe are pleased to inform you that your interview for the position of ${app.jobId?.title || 'the role'} has been scheduled.\n\nDate: ${dateStr}\nTime: ${timeStr}\nMode: ${modeStr}\n${locStr}\n\nWe look forward to speaking with you.\n\nBest regards,\nThe Hiring Team`);
       }
    }
  }, [schedulingAppId, applications, scheduleDate, scheduleTime, scheduleMode, scheduleLocation, messageEdited]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'users') {
        const response = await axios.get('http://localhost:5000/api/users');
        setUsers(response.data);
      } else if (activeTab === 'apps') {
        const response = await axios.get('http://localhost:5000/api/job/applications');
        setApplications(response.data);
      } else if (activeTab === 'job') {
        const response = await axios.get('http://localhost:5000/api/job/current');
        setJobs(Array.isArray(response.data) ? response.data : [response.data].filter(Boolean));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!jobTitle || !jobDescription) return;
    try {
      await axios.post('http://localhost:5000/api/job/create', {
        title: jobTitle,
        description: jobDescription
      });
      setSuccess('Job posting created successfully');
      setJobTitle('');
      setJobDescription('');
      setShowAddJob(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create job');
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/job/${id}`);
      setSuccess('Job deleted');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to delete job');
    }
  };

  const handleScheduleInterview = async () => {
    if (!schedulingAppId || !scheduleDate || !scheduleTime || !scheduleLocation) return;
    try {
      await axios.post(`http://localhost:5000/api/job/applications/${schedulingAppId}/schedule`, {
        date: scheduleDate,
        time: scheduleTime,
        mode: scheduleMode,
        location: scheduleLocation,
        customMessage: messageEdited ? scheduleMessage : undefined
      });
      setSuccess('Interview scheduled successfully and email sent.');
      setSchedulingAppId(null);
      setScheduleDate('');
      setScheduleTime('');
      setScheduleLocation('');
      setScheduleMessage('');
      setMessageEdited(false);
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to schedule interview');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleGenerateInterview = async (id: string) => {
    setGeneratingInterviewId(id);
    try {
      await axios.post(`http://localhost:5000/api/job/applications/${id}/generate-interview`);
      setSuccess('Written interview generated successfully.');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to generate interview.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setGeneratingInterviewId(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const exportToExcel = (appsToExport: ApplicationData[] = applications, jobTitle?: string) => {
    if (appsToExport.length === 0) return;

    const headers = ['Applicant Name', 'Email', 'Position', 'Score', 'Match Status', 'Reason', 'Applied Date'];
    const rows = appsToExport.map(app => [
      app.userId?.name || 'N/A',
      app.userId?.email || 'N/A',
      app.jobId?.title || 'N/A',
      `${app.matchScore}%`,
      app.isMatch === true ? 'Matched' : app.isMatch === false ? 'Mismatched' : 'N/A',
      (app.reason || '').replace(/"/g, '""'),
      new Date(app.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const filename = jobTitle 
      ? `${jobTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_applications_${new Date().toISOString().split('T')[0]}.csv`
      : `all_applications_${new Date().toISOString().split('T')[0]}.csv`;
      
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderAppTable = (tableApps: ApplicationData[]) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-black/10 text-xs uppercase tracking-widest text-slate-500 font-bold border-b border-white/5">
            <th className="px-6 py-4">Applicant</th>
            <th className="px-6 py-4 text-center">Score</th>
            <th className="px-6 py-4">Match Status</th>
            <th className="px-6 py-4">Actions</th>
            <th className="px-6 py-4">Applied Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {tableApps.map(app => (
            <tr key={app._id} className="hover:bg-white/[0.02] transition-colors group">
              <td className="px-6 py-4">
                <div className="font-bold text-white text-sm">{app.userId?.name}</div>
                <div className="text-xs text-slate-500">{app.userId?.email}</div>
              </td>
              <td className="px-6 py-4 text-center">
                <div className={`inline-block px-3 py-1 rounded-lg text-sm font-bold ${app.matchScore > 80 ? 'text-emerald-400 bg-emerald-500/10' : 'text-indigo-400 bg-indigo-500/10'}`}>
                  {app.matchScore}%
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  {app.isMatch !== undefined ? (
                    <>
                      <div className={`flex items-center gap-1.5 text-xs font-bold uppercase ${app.isMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                        {app.isMatch ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {app.isMatch ? 'Matched' : 'Mismatched'}
                      </div>
                      {app.reason && <div className="text-[10px] text-slate-500 max-w-[200px] truncate hover:text-slate-300 transition-colors" title={app.reason}>{app.reason}</div>}
                    </>
                  ) : (
                    <div className={`flex items-center gap-1.5 text-xs font-bold uppercase ${app.matchScore >= 80 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {app.matchScore >= 80 ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {app.matchScore >= 80 ? 'Matched' : 'Mismatched'}
                        <span className="ml-1 text-[8px] opacity-50 italic">(Legacy)</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col gap-2 items-start">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedResume(app.resumeText)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold border border-white/5 transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" /> View
                    </button>
                    <button 
                      onClick={() => setSchedulingAppId(app._id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 rounded-lg text-xs font-bold border border-indigo-500/20 transition-all whitespace-nowrap"
                    >
                      <Calendar className="w-3.5 h-3.5" /> {app.status === 'scheduled' ? 'Reschedule' : 'Schedule'}
                    </button>
                    {(app.isMatch !== false && app.matchScore >= 80 || app.status === 'accepted' || app.status === 'scheduled') && (
                      <>
                        {!app.writtenInterview ? (
                          <button 
                            onClick={() => handleGenerateInterview(app._id)}
                            disabled={generatingInterviewId === app._id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20 transition-all whitespace-nowrap disabled:opacity-50"
                          >
                            {generatingInterviewId === app._id ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <BrainCircuit className="w-3.5 h-3.5" />} Generate Q&A
                          </button>
                        ) : app.writtenInterview.status === 'pending' ? (
                          <span className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg text-xs font-bold border border-white/5 whitespace-nowrap">
                            Q&A Pending
                          </span>
                        ) : (
                          <button 
                            onClick={() => setSelectedInterview(app)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-pink-600/20 hover:bg-pink-600/40 text-pink-400 rounded-lg text-xs font-bold border border-pink-500/20 transition-all whitespace-nowrap"
                          >
                            <BrainCircuit className="w-3.5 h-3.5" /> View Answers
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  {app.status === 'scheduled' && app.interviewDate && (
                    <div className="text-[10px] text-indigo-400">
                      Scheduled: {new Date(app.interviewDate).toLocaleDateString()} at {app.interviewTime}
                      <div className="mt-0.5 opacity-80">
                        {app.interviewMode === 'online' ? 'Online: ' : 'Offline: '} 
                        <span className="text-slate-300">{app.interviewLocation}</span>
                      </div>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                {new Date(app.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B0F19] p-4 md:p-8 font-sans text-slate-200">
      <div className="fixed top-0 left-0 w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] pointer-events-none rounded-full"></div>
      <div className="fixed bottom-0 right-0 w-[50%] h-[50%] bg-emerald-600/10 blur-[150px] pointer-events-none rounded-full"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                <Shield className="w-8 h-8 text-emerald-400" />
                Admin Console
              </h1>
              <p className="text-slate-400 mt-1 font-medium">Platform Management Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-900/40 p-2 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex items-center gap-3 px-3">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold border border-emerald-500/30">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-bold text-white leading-tight">{user?.name}</div>
                <div className="text-xs text-emerald-400 font-medium tracking-wide">Administrator</div>
              </div>
            </div>
            <button onClick={handleLogout} className="p-3 hover:bg-red-500/10 rounded-xl transition-colors text-slate-400 hover:text-red-400">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 bg-slate-900/40 p-1.5 rounded-2xl border border-white/5 w-fit">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            Users
          </button>
          <button 
            onClick={() => setActiveTab('job')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'job' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            Job Description
          </button>
          <button 
            onClick={() => setActiveTab('apps')}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'apps' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            Applications
          </button>
        </div>

        {/* Content Section */}
        <div className="glass-panel rounded-3xl border border-white/5 bg-slate-900/40 overflow-hidden shadow-2xl min-h-[500px]">
          {/* Messages */}
          {error && (
            <div className="m-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 font-medium">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="m-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 font-medium">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center h-[500px]">
              <Loader className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
          )}

          {!loading && activeTab === 'users' && (
            <div className="overflow-x-auto">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-indigo-400" /> Registered Users</h2>
                <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">{users.length} Total</span>
              </div>
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-black/20 text-xs uppercase tracking-widest text-slate-400 font-bold">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Auth</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${u.isAdmin ? 'bg-emerald-500' : 'bg-indigo-500'}`}>{u.name.charAt(0)}</div>
                          <div><div className="font-bold text-white text-sm">{u.name}</div><div className="text-xs text-slate-500">{u.email}</div></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-400">{u.googleId ? 'Google' : 'Standard'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                          u.plan === 'advanced' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 
                          u.plan === 'basic' || !u.plan ? 'bg-slate-800 text-slate-500' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {u.plan || 'basic'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${u.isAdmin ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>{u.isAdmin ? 'Admin' : 'User'}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && activeTab === 'job' && (
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Briefcase className="w-5 h-5 text-indigo-400" /> Job Openings</h2>
                  <p className="text-slate-400 text-sm mt-1">Manage all active positions and descriptions.</p>
                </div>
                <button 
                  onClick={() => setShowAddJob(!showAddJob)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                >
                  {showAddJob ? <ArrowLeft className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showAddJob ? 'Back to List' : 'Add New Position'}
                </button>
              </div>

              {showAddJob ? (
                <div className="space-y-6 max-w-2xl animate-in slide-in-from-bottom duration-300">
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Job Title</label>
                    <input 
                      type="text" 
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Senior Frontend Developer"
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Job Description</label>
                    <textarea 
                      rows={10}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Enter detailed job requirements, responsibilities, and qualifications..."
                      className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none shadow-inner"
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-4">
                    <button 
                      onClick={handleCreateJob}
                      disabled={!jobTitle || !jobDescription}
                      className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white px-10 py-3.5 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                    >
                      Post Job Opening
                    </button>
                    {success && <span className="text-emerald-400 font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> {success}</span>}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {jobs.map(job => (
                    <div key={job._id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDeleteJob(job._id)}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-all"
                          title="Delete Job"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{job.title}</h3>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Posted on {new Date(job.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-slate-400 line-clamp-3 leading-relaxed mb-4 italic">
                        {job.description}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded-lg border border-emerald-500/20 tracking-wider">Active</span>
                      </div>
                    </div>
                  ))}
                  {jobs.length === 0 && (
                    <div className="text-center py-20 bg-black/10 rounded-3xl border border-dashed border-white/5">
                      <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">No job openings found. Click "Add New Position" to start.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!loading && activeTab === 'apps' && (
            <div className="flex flex-col">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><ArrowLeft className="w-5 h-5 text-indigo-400 rotate-180" /> Candidate Applications</h2>
                  <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">{applications.length} Received</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search candidates..."
                      value={appSearchTerm}
                      onChange={(e) => setAppSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 bg-slate-900 border border-white/5 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all w-64"
                    />
                  </div>
                  <button 
                    onClick={() => exportToExcel()}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                  >
                    <Download className="w-4 h-4" /> Export All to Excel
                  </button>
                </div>
              </div>
              
              <div className="p-6 flex flex-col gap-8">
                {Object.entries(
                  applications.filter(app => {
                    const term = appSearchTerm.toLowerCase();
                    return (
                      app.userId?.name?.toLowerCase().includes(term) ||
                      app.userId?.email?.toLowerCase().includes(term) ||
                      app.jobId?.title?.toLowerCase().includes(term)
                    );
                  }).reduce((acc, app) => {
                    const jobTitle = app.jobId?.title || 'Unknown Position';
                    if (!acc[jobTitle]) acc[jobTitle] = [];
                    acc[jobTitle].push(app);
                    return acc;
                  }, {} as Record<string, ApplicationData[]>)
                ).map(([jobTitle, apps]) => {
                  const matchedApps = apps.filter(app => app.isMatch !== undefined ? app.isMatch : app.matchScore >= 80);
                  const mismatchedApps = apps.filter(app => app.isMatch !== undefined ? !app.isMatch : app.matchScore < 80);

                  return (
                  <div key={jobTitle} className="bg-slate-950/40 rounded-2xl border border-white/5 overflow-hidden">
                    <div className="p-4 bg-black/20 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-indigo-400" />
                          {jobTitle}
                        </h3>
                        <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-xs font-bold">{apps.length} Applications</span>
                      </div>
                      <button 
                        onClick={() => exportToExcel(apps, jobTitle)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20 transition-all shadow-lg active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" /> Export Job
                      </button>
                    </div>
                    
                    {matchedApps.length > 0 && (
                      <div className="mb-2">
                        <div className="px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/10 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Matched Candidates ({matchedApps.length})</h4>
                        </div>
                        {renderAppTable(matchedApps)}
                      </div>
                    )}

                    {mismatchedApps.length > 0 && (
                      <div>
                        <div className="px-6 py-3 bg-red-500/10 border-y border-red-500/10 flex items-center gap-2">
                          <XCircle className="w-4 h-4 text-red-400" />
                          <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider">Mismatched Candidates ({mismatchedApps.length})</h4>
                        </div>
                        {renderAppTable(mismatchedApps)}
                      </div>
                    )}
                  </div>
                )})}
                
                {applications.length === 0 && (
                  <div className="text-center py-12 bg-black/10 rounded-2xl border border-dashed border-white/5">
                    <p className="text-slate-500 font-medium">No applications received yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resume Viewer Modal */}
      {selectedResume && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[85vh] glass-panel bg-slate-900 flex flex-col border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <FileText className="w-6 h-6 text-emerald-400" />
                Resume Content
              </h3>
              <button 
                onClick={() => setSelectedResume(null)}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <pre className="whitespace-pre-wrap text-slate-300 font-sans text-base leading-relaxed">
                {selectedResume}
              </pre>
            </div>
            <div className="px-8 py-6 border-t border-white/5 bg-white/[0.02] flex justify-end">
              <button 
                onClick={() => setSelectedResume(null)}
                className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-white/5"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {schedulingAppId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl glass-panel bg-slate-900 flex flex-col border border-white/10 shadow-2xl rounded-3xl overflow-hidden p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Schedule Interview
            </h3>
            <div className="space-y-4">
              <div className="flex gap-6 mb-2">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-300 cursor-pointer hover:text-white transition-colors">
                  <input 
                    type="radio" 
                    name="mode" 
                    checked={scheduleMode === 'online'} 
                    onChange={() => setScheduleMode('online')} 
                    className="accent-indigo-500 w-4 h-4 cursor-pointer" 
                  />
                  Online (Video Call)
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-300 cursor-pointer hover:text-white transition-colors">
                  <input 
                    type="radio" 
                    name="mode" 
                    checked={scheduleMode === 'offline'} 
                    onChange={() => setScheduleMode('offline')} 
                    className="accent-indigo-500 w-4 h-4 cursor-pointer" 
                  />
                  Offline (In-Person)
                </label>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-400 mb-2">Select Date</label>
                  <input 
                    type="date" 
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-400 mb-2">Select Time</label>
                  <input 
                    type="time" 
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">
                  {scheduleMode === 'online' ? 'Meeting Link (Google Meet, Zoom, etc.)' : 'Office Location / Address'}
                </label>
                <input 
                  type="text" 
                  value={scheduleLocation}
                  onChange={(e) => setScheduleLocation(e.target.value)}
                  placeholder={scheduleMode === 'online' ? 'e.g. https://meet.google.com/abc-defg-hij' : 'e.g. 123 Main St, Floor 4, Meeting Room A'}
                  className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-400">Email Prompt Preview</label>
                  {messageEdited && (
                    <button 
                      onClick={() => setMessageEdited(false)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                    >
                      Reset to Auto-Generated
                    </button>
                  )}
                </div>
                <textarea 
                  rows={14}
                  value={scheduleMessage}
                  onChange={(e) => {
                    setScheduleMessage(e.target.value);
                    setMessageEdited(true);
                  }}
                  className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500/50 resize-y font-sans min-h-[250px]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => {
                  setSchedulingAppId(null);
                  setScheduleDate('');
                  setScheduleTime('');
                  setScheduleLocation('');
                  setScheduleMessage('');
                  setMessageEdited(false);
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleScheduleInterview}
                disabled={!scheduleDate || !scheduleTime || !scheduleLocation}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all"
              >
                Confirm & Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Written Interview Viewer Modal */}
      {selectedInterview && selectedInterview.writtenInterview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[85vh] glass-panel bg-slate-900 flex flex-col border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <BrainCircuit className="w-6 h-6 text-pink-400" />
                Written Interview Answers - {selectedInterview.userId?.name}
              </h3>
              <button 
                onClick={() => setSelectedInterview(null)}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
              {selectedInterview.writtenInterview.evaluation && (
                <div className="mb-8 p-6 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl flex items-center justify-between shadow-lg">
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">AI Evaluation</h4>
                    <p className="text-slate-400 text-sm">Overall correctness based on the job description.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-indigo-400">
                      {selectedInterview.writtenInterview.evaluation.overallScore}%
                    </span>
                    <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Score</span>
                  </div>
                </div>
              )}

              {selectedInterview.writtenInterview.questions.map((q, idx) => (
                <div key={idx} className="bg-slate-950/50 p-6 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-white font-bold flex gap-3 text-sm">
                    <span className="text-pink-400 shrink-0">Q{idx + 1}.</span> {q}
                  </h4>
                  <div className="bg-slate-900 p-4 rounded-xl border border-white/5 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                    {selectedInterview.writtenInterview!.answers[idx] || <span className="text-slate-500 italic">No answer provided.</span>}
                  </div>
                  {selectedInterview.writtenInterview?.evaluation?.answerScores && selectedInterview.writtenInterview.evaluation.answerScores[idx] && (
                    <div className="bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20 text-emerald-300 text-sm">
                      <strong className="text-emerald-400">AI Feedback:</strong> {selectedInterview.writtenInterview.evaluation.answerScores[idx]}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="px-8 py-6 border-t border-white/5 bg-white/[0.02] flex justify-end">
              <button 
                onClick={() => setSelectedInterview(null)}
                className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all border border-white/5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
