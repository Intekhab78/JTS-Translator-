import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Globe, Shield, Download, Share2, MessageSquare, Plus, X } from 'lucide-react';
import { Waveform } from '../components/Waveform';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { socketService } from '../services/socketService';
import { FileUploader } from '../components/FileUploader';
import { useAuth } from '../context/AuthContext';
import { PlanGuard } from '../components/PlanGuard';
import { AppLayout } from '../components/AppLayout';
import { motion, AnimatePresence } from 'framer-motion';

interface FactCheck {
  status: 'true' | 'false' | 'unverified';
  reason: string;
}

interface Message {
  text: string;
  isFinal: boolean;
  type: 'source' | 'translated';
  factCheck?: FactCheck;
}

export const Dashboard: React.FC = () => {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [sourceMessages, setSourceMessages] = useState<Message[]>([]);
  const [translatedMessages, setTranslatedMessages] = useState<Message[]>([]);
  const [currentRoom] = useState('ROOM_123');
  const [showUpload, setShowUpload] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const { isRecording, toggleRecording } = useAudioRecorder((chunk) => {
    socketService.sendAudioChunk(chunk);
  });

  useEffect(() => {
    socketService.joinRoom(currentRoom);

    const handleTranscript = (data: any) => {
      const { text, isFinal, type } = data;

      if (type === 'source') {
        updateMessages(setSourceMessages, text, isFinal);
      } else {
        updateMessages(setTranslatedMessages, text, isFinal);
      }
    };

    socketService.onTranscript(handleTranscript);

    const handleFactCheck = (data: any) => {
      const { text, factCheck, type } = data;
      const setter = type === 'source' ? setSourceMessages : setTranslatedMessages;
      setter(prev => prev.map(msg => 
        msg.text === text ? { ...msg, factCheck } : msg
      ));
    };

    socketService.onFactCheck(handleFactCheck);

    return () => {
      socketService.offTranscript(handleTranscript);
      socketService.offFactCheck(handleFactCheck);
    };
  }, [currentRoom]);

  const updateMessages = (setter: React.Dispatch<React.SetStateAction<Message[]>>, text: string, isFinal: boolean) => {
    setter(prev => {
      const lastMessage = prev[prev.length - 1];
      if (lastMessage && !lastMessage.isFinal) {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = { text, isFinal, type: lastMessage.type };
        return newMessages;
      } else {
        return [...prev, { text, isFinal, type: 'source' }];
      }
    });
  };

  const handleToggleMic = () => {
    if (!isRecording) {
      socketService.startStream(currentRoom, sourceLang, targetLang);
    } else {
      socketService.stopStream();
    }
    toggleRecording();
  };

  const handleUploadComplete = (originalText: string, translatedText: string, factCheckResult?: FactCheck) => {
    setSourceMessages(prev => [...prev, { text: originalText, isFinal: true, type: 'source', factCheck: factCheckResult }]);
    setTranslatedMessages(prev => [...prev, { text: translatedText, isFinal: true, type: 'translated', factCheck: factCheckResult }]);
    setShowUpload(false);
  };

  const handleDownload = () => {
    const textToDownload = translatedMessages.map(msg => msg.text).join('\n');
    if (!textToDownload) return;
    
    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    const textToCopy = translatedMessages.map(msg => msg.text).join('\n');
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <AppLayout>
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-4 md:py-8 flex flex-col h-full min-h-[calc(100vh-80px)] lg:min-h-screen">
        
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">JtsStream Translation</h1>
          <p className="text-slate-400">Real-time hybrid translation and transcription powered by AI.</p>
        </header>

        {/* Main Content */}
        <main className="flex-1 mb-6">
          <PlanGuard 
            feature="stream" 
            fallbackTitle="Stream Pro Required" 
            fallbackDescription="The JtsStream real-time translation engine is a premium feature. Please upgrade to Stream Pro or the Advanced Plan to start streaming."
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-[600px]">
              {/* Input Block */}
              <section className="glass-panel flex flex-col overflow-hidden relative group border border-white/10 bg-slate-900/60 backdrop-blur-md rounded-3xl shadow-2xl">
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-indigo-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                      <Mic className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h2 className="font-bold text-lg text-white">Input Stream</h2>
                  </div>
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="bg-slate-900/80 border border-white/10 rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-200"
                  >
                    <option value="auto">Auto Detect</option>
                    <option value="en">English (US)</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="hi">Hindi</option>
                    <option value="ar">Arabic</option>
                    <option value="zh-CN">Mandarin Chinese</option>
                    <option value="pt">Portuguese</option>
                    <option value="bn">Bengali</option>
                    <option value="ru">Russian</option>
                    <option value="ja">Japanese</option>
                    <option value="pa">Western Punjabi</option>
                    <option value="tr">Turkish</option>
                    <option value="vi">Vietnamese</option>
                  </select>
                </div>

                <div className="flex-1 px-4 py-2 md:px-6 md:py-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                  {sourceMessages.length === 0 && !isRecording && (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 gap-4">
                      <div className="p-6 bg-slate-800/50 rounded-full border-2 border-dashed border-slate-600">
                        <Mic className="w-12 h-12 text-slate-400" />
                      </div>
                      <p className="text-base font-medium text-center max-w-[220px]">Start speaking to see the live transcription here</p>
                    </div>
                  )}
                  <AnimatePresence>
                    {sourceMessages.map((msg, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        key={idx}
                        className={`px-5 py-3.5 rounded-2xl text-slate-200 text-lg font-medium leading-relaxed max-w-[90%] ${
                          msg.isFinal 
                            ? 'bg-indigo-600/10 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
                            : 'bg-white/5 border border-white/10 animate-pulse'
                        }`}
                      >
                        <div>{msg.text}</div>
                        {msg.factCheck && (
                          (user?.plan === 'advanced' || user?.plan === 'truth') ? (
                            <div className={`mt-3 text-sm flex flex-col gap-1 p-2.5 rounded-xl ${
                              msg.factCheck.status === 'true' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                              msg.factCheck.status === 'false' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                              'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                            }`}>
                              <div className="flex items-center gap-1.5 font-bold">
                                {msg.factCheck.status === 'true' ? '✅ Verified True' :
                                msg.factCheck.status === 'false' ? '❌ False' : '⚠️ Unverified'}
                              </div>
                              <div className="text-xs opacity-90 leading-relaxed">{msg.factCheck.reason}</div>
                            </div>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/pricing');
                              }}
                              className="mt-3 text-xs bg-slate-900/50 hover:bg-slate-800 text-slate-400 py-2 px-3 rounded-xl border border-white/10 flex items-center gap-2 transition-colors group w-full"
                            >
                              <Shield className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                              Truth Guard Locked • Upgrade to view verification
                            </button>
                          )
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="p-4 md:p-6 bg-slate-950/40 border-t border-white/10 space-y-4 backdrop-blur-md">
                  <div className="waveform-container flex items-center justify-center group-hover:border-indigo-500/30 transition-colors">
                    {isRecording ? (
                      <Waveform isRecording={isRecording} />
                    ) : (
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        Microphone Ready
                      </p>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={handleToggleMic}
                      className={`flex-1 ${isRecording ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500'} text-white font-bold py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="w-6 h-6" /> Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="w-6 h-6" /> Start Live Audio
                        </>
                      )}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowUpload(true)}
                        className="p-4 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all active:scale-95"
                      >
                        <Plus className="w-6 h-6 text-slate-300" />
                      </button>
                      <button className="p-4 bg-indigo-600/20 hover:bg-indigo-600/30 rounded-xl border border-indigo-500/30 transition-all active:scale-95">
                        <Send className="w-6 h-6 text-indigo-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Output Block */}
              <section className="glass-panel flex flex-col overflow-hidden relative group border border-white/10 bg-slate-900/60 backdrop-blur-md rounded-3xl shadow-2xl">
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-pink-900/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/20 rounded-xl">
                      <Globe className="w-5 h-5 text-pink-400" />
                    </div>
                    <h2 className="font-bold text-lg text-white">Translated Stream</h2>
                  </div>
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-slate-900/80 border border-white/10 rounded-xl text-sm px-4 py-2 focus:ring-2 focus:ring-pink-500 transition-all outline-none text-slate-200"
                  >
                    <option value="es">Spanish</option>
                    <option value="en">English (US)</option>
                    <option value="fr">French</option>
                    <option value="hi">Hindi</option>
                    <option value="ar">Arabic</option>
                    <option value="zh-CN">Mandarin Chinese</option>
                    <option value="pt">Portuguese</option>
                    <option value="bn">Bengali</option>
                    <option value="ru">Russian</option>
                    <option value="ja">Japanese</option>
                    <option value="pa">Western Punjabi</option>
                    <option value="tr">Turkish</option>
                    <option value="vi">Vietnamese</option>
                  </select>
                </div>

                <div className="flex-1 px-4 py-2 md:px-6 md:py-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
                  {translatedMessages.length === 0 && !isRecording && (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 gap-4">
                      <div className="p-6 bg-slate-800/50 rounded-full border-2 border-dashed border-slate-600">
                        <Globe className="w-12 h-12 text-slate-400" />
                      </div>
                      <p className="text-base font-medium text-center max-w-[220px]">Translations will appear here instantly</p>
                    </div>
                  )}
                  <AnimatePresence>
                    {translatedMessages.map((msg, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        key={idx}
                        className="bg-pink-600/10 border border-pink-500/20 px-5 py-3.5 rounded-2xl text-slate-200 text-lg font-medium leading-relaxed max-w-[90%] self-end shadow-lg shadow-pink-500/5"
                      >
                        <div>{msg.text}</div>
                        {msg.factCheck && (
                          (user?.plan === 'advanced' || user?.plan === 'truth') ? (
                            <div className={`mt-3 text-sm flex flex-col gap-1 p-2.5 rounded-xl ${
                              msg.factCheck.status === 'true' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                              msg.factCheck.status === 'false' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                              'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                            }`}>
                              <div className="flex items-center gap-1.5 font-bold">
                                {msg.factCheck.status === 'true' ? '✅ Verified True' :
                                msg.factCheck.status === 'false' ? '❌ False' : '⚠️ Unverified'}
                              </div>
                              <div className="text-xs opacity-90 leading-relaxed">{msg.factCheck.reason}</div>
                            </div>
                          ) : (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/pricing');
                              }}
                              className="mt-3 text-xs bg-slate-900/50 hover:bg-slate-800 text-slate-400 py-2 px-3 rounded-xl border border-white/10 flex items-center gap-2 transition-colors group w-full"
                            >
                              <Shield className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                              Truth Guard Locked • Upgrade to view verification
                            </button>
                          )
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="p-4 md:p-6 bg-slate-950/40 border-t border-white/10 flex justify-between gap-4 backdrop-blur-md">
                  <div className="flex gap-2">
                    <button 
                      onClick={handleCopy}
                      className="p-4 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 border border-transparent hover:border-white/10" 
                      title="Quick Copy"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleDownload}
                      className="p-4 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 border border-transparent hover:border-white/10" 
                      title="Download Transcript"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                  <button className="bg-pink-600/20 hover:bg-pink-600/30 border border-pink-500/30 text-pink-400 font-bold py-3 px-6 md:px-8 rounded-xl flex items-center gap-2 md:gap-3 shadow-lg shadow-pink-600/10 whitespace-nowrap transition-colors active:scale-95">
                    <MessageSquare className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm md:text-base">Quick Reply</span>
                  </button>
                </div>
              </section>
            </div>
          </PlanGuard>
        </main>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-lg glass-panel p-8 relative rounded-3xl border border-white/10 shadow-2xl">
              <button
                onClick={() => setShowUpload(false)}
                className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
              <h3 className="text-xl font-bold text-white mb-2">Upload Content</h3>
              <p className="text-slate-400 text-sm mb-6">Import audio, video or documents to translate them instantly.</p>
              <FileUploader
                sourceLang={sourceLang}
                targetLang={targetLang}
                onUploadComplete={handleUploadComplete}
              />
              <button
                onClick={() => setShowUpload(false)}
                className="w-full mt-6 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-bold text-white transition-all shadow-lg active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
