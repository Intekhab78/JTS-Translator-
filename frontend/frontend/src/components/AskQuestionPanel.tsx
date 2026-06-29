import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, MessageSquare, Send, FileText, Loader2, X, Mic, Square, VolumeX } from 'lucide-react';

interface QAMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
}

const LANGUAGES = [
  { code: 'auto', name: 'Auto Detect' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }
];

export const AskQuestionPanel: React.FC = () => {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize audio element once to allow reusing it and bypassing autoplay restrictions
    audioPlayerRef.current = new Audio();
    
    // Cleanup speech on unmount
    return () => {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current.src = '';
        audioPlayerRef.current = null;
      }
    };
  }, []);

  const speakText = async (text: string, lang: string) => {
    try {
      if (!audioPlayerRef.current) return;
      
      // Pause any ongoing speech
      audioPlayerRef.current.pause();

      const response = await fetch('http://localhost:5000/api/qa/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: lang }),
      });

      if (!response.ok) throw new Error('TTS failed');

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      
      audioPlayerRef.current.src = audioUrl;
      audioPlayerRef.current.onended = () => {
        URL.revokeObjectURL(audioUrl);
        setIsPlaying(false);
      };
      
      await audioPlayerRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play TTS audio', err);
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/qa/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setDocumentId(data.documentId);
      setFileName(file.name);
      
      const welcomeMessage = data.initialQuestions || `Successfully processed ${file.name}. What would you like to know about it?`;
      
      setMessages([{
        id: Date.now().toString(),
        text: welcomeMessage,
        sender: 'ai'
      }]);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      alert(`Failed to upload and process the document: ${error.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAskQuestion = async (overrideText?: string, speakResponse = false) => {
    const textToAsk = typeof overrideText === 'string' ? overrideText : inputValue;
    if (!textToAsk.trim() || !documentId) return;

    const question = textToAsk.trim();
    if (typeof overrideText !== 'string') {
      setInputValue('');
    }
    
    // Add user message using functional update
    setMessages(prev => [
      ...prev,
      { id: Date.now().toString(), text: question, sender: 'user' }
    ]);
    setIsAsking(true);

    try {
      const response = await fetch('http://localhost:5000/api/qa/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, question, language: selectedLanguage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get answer');
      }

      const data = await response.json();
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: data.answer, sender: 'ai' }
      ]);

      if (speakResponse) {
        speakText(data.answer, selectedLanguage);
      }
    } catch (error) {
      console.error('Error asking question:', error);
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), text: "Sorry, I encountered an error while trying to answer your question.", sender: 'ai' }
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAskQuestion();
    }
  };

  const startRecording = async () => {
    try {
      // Unlock the audio element to bypass autoplay restrictions later
      if (audioPlayerRef.current) {
        audioPlayerRef.current.play().catch(() => {});
        audioPlayerRef.current.pause();
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    // Unlock the audio element here as well, since this is a user click
    if (audioPlayerRef.current) {
      audioPlayerRef.current.play().catch(() => {});
      audioPlayerRef.current.pause();
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsAsking(true);
    const formData = new FormData();
    formData.append('audio', audioBlob, 'question.webm');
    formData.append('language', selectedLanguage);

    try {
      const response = await fetch('http://localhost:5000/api/qa/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');
      const data = await response.json();
      
      if (data.text) {
        setInputValue(data.text);
        handleAskQuestion(data.text, true);
      }
    } catch (err) {
      console.error('Error processing audio:', err);
      alert('Failed to transcribe audio.');
    } finally {
      setIsAsking(false);
    }
  };

  const resetPanel = () => {
    setDocumentId(null);
    setFileName(null);
    setMessages([]);
    setInputValue('');
  };

  return (
    <section className="glass-panel flex flex-col overflow-hidden relative mt-6 h-[550px]">
      <div className="px-6 py-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="font-semibold text-base md:text-lg text-slate-200">Ask Question</h2>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {isPlaying && (
            <button 
              onClick={stopAudio}
              className="text-xs text-rose-400 hover:text-rose-200 flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shadow-lg shadow-rose-500/10"
            >
              <VolumeX className="w-3 h-3" /> Stop Audio
            </button>
          )}

          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="flex-1 sm:flex-none bg-slate-800 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500/50 transition-colors"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>

          {documentId && (
            <button 
              onClick={resetPanel}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-800/50 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              <X className="w-3 h-3" /> Clear Document
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {!documentId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-900/20">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt"
              className="hidden" 
              id="doc-upload"
            />
            <label 
              htmlFor="doc-upload"
              className={`flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                isUploading 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 bg-slate-800/30'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <>
                    <Loader2 className="w-10 h-10 text-emerald-400 mb-3 animate-spin" />
                    <p className="text-sm font-semibold text-slate-300">Processing Document...</p>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-10 h-10 text-slate-400 mb-3 group-hover:text-emerald-400 transition-colors" />
                    <p className="mb-2 text-sm font-semibold text-slate-200">
                      Click to upload a document
                    </p>
                    <p className="text-xs text-slate-500">PDF, DOCX, or TXT (Max 10MB)</p>
                  </>
                )}
              </div>
            </label>
          </div>
        ) : (
          <>
            <div className="flex-1 px-4 py-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
              <div className="flex justify-center mb-2">
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full flex items-center gap-2">
                  <FileText className="w-3 h-3" /> {fileName} uploaded
                </span>
              </div>
              
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm md:text-base shadow-md ${
                    msg.sender === 'user' 
                      ? 'bg-emerald-600 text-white rounded-br-sm' 
                      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAsking && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm shadow-md flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span className="text-sm opacity-80">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-white/5 flex gap-2">
              {isRecording ? (
                <button
                  onClick={stopRecording}
                  className="p-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center animate-pulse"
                  title="Stop recording"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
              ) : (
                <button
                  onClick={startRecording}
                  disabled={isAsking}
                  className="p-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:hover:bg-slate-700 text-white rounded-xl transition-colors shadow-lg flex items-center justify-center"
                  title="Ask with voice"
                >
                  <Mic className="w-5 h-5" />
                </button>
              )}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isRecording ? "Listening..." : "Ask a question about the document..."}
                disabled={isAsking || isRecording}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all disabled:opacity-50"
              />
              <button
                onClick={() => handleAskQuestion()}
                disabled={!inputValue.trim() || isAsking || isRecording}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-xl transition-colors shadow-lg shadow-emerald-600/20 disabled:shadow-none flex items-center justify-center"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
