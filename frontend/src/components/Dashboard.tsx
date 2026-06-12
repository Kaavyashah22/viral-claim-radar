import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, Loader2, Sparkles, ActivitySquare, MessageCircle, Moon, Sun } from 'lucide-react';
import { AnalysisResultView, type AnalysisPayload } from './AnalysisResult';
import { FeedSimulator } from './FeedSimulator';
import { useTheme } from './theme-provider';
import { Toaster, toast } from 'react-hot-toast';

const LOADING_STEPS = [
  "Scanning global corpus...",
  "Analyzing semantic stance...",
  "Finalizing verdict..."
];

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'manual' | 'feed'>('manual');

  // Manual Tab State
  const [textClaim, setTextClaim] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AnalysisPayload | null>(null);
  const [isHoveringDrop, setIsHoveringDrop] = useState(false);
  const [shake, setShake] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHoveringDrop(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setTextClaim('');
    }
  };

  const handleAnalyze = async () => {
    if (!textClaim && !selectedFile) {
      toast.error("Please provide a claim to verify.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      if (selectedFile) formData.append('image', selectedFile);
      else if (textClaim) formData.append('text', textClaim);

      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to analyze claim. Ensure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-gray-50'}`}>
      <Toaster position="top-center" toastOptions={{ className: theme === 'dark' ? '!bg-slate-800 !text-white !border !border-white/10' : '' }} />
      <div className="w-full max-w-5xl space-y-10 relative">

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="absolute right-0 top-0 p-3 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-md text-slate-900 dark:text-yellow-400 hover:scale-105 transition-all duration-300 flex items-center justify-center"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Header Section */}
        <div className="text-center space-y-3 pt-4">
          <motion.h1 layout initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight flex justify-center items-center gap-3">
            Viral Claim Radar <Sparkles className="text-blue-500 w-10 h-10" />
          </motion.h1>
          <motion.p layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto">
            A high-speed fact-checking copilot. Detect viral misinformation across languages and media formats.
          </motion.p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center">
          <div className="bg-gray-200 dark:bg-slate-900/50 p-1.5 rounded-full inline-flex font-semibold text-sm border dark:border-white/5">
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-6 py-2.5 rounded-full transition-all flex items-center gap-2 ${activeTab === 'manual' ? 'bg-white dark:bg-[#0f172a] shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              <ActivitySquare className="w-4 h-4" /> Manual Verify
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-6 py-2.5 rounded-full transition-all flex items-center gap-2 ${activeTab === 'feed' ? 'bg-white dark:bg-[#0f172a] shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
            >
              <MessageCircle className="w-4 h-4" /> Feed Simulator
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'feed' ? (
            <motion.div key="feed" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <FeedSimulator />
            </motion.div>
          ) : (
            <motion.div key="manual" layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">

              {/* Verify Input Component */}
              <motion.div
                layout
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="bg-white dark:bg-[#0f172a] p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-white/10 hover:shadow-xl dark:shadow-black/50 transition-shadow"
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                      Analyze Text Claim
                    </label>
                    <textarea
                      rows={3}
                      className="block w-full rounded-2xl border-gray-200 dark:border-white/10 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:ring-blue-500/50 text-lg p-5 border bg-gray-50 dark:bg-slate-900/50 dark:text-white transition-colors resize-none placeholder:dark:text-gray-500"
                      placeholder="Paste a suspicious claim or tweet..."
                      value={textClaim}
                      onChange={(e) => { setTextClaim(e.target.value); if (selectedFile) setSelectedFile(null); }}
                    />
                  </div>

                  <div
                    className={`flex justify-center px-6 py-8 border-2 border-dashed rounded-2xl transition-all duration-200 ${isHoveringDrop ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-500 scale-[1.01]' : 'border-gray-300 dark:border-slate-800 hover:border-gray-400 dark:hover:border-slate-600 dark:bg-slate-900/20'
                      }`}
                    onDragOver={(e) => { e.preventDefault(); setIsHoveringDrop(true); }}
                    onDragLeave={() => setIsHoveringDrop(false)}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-2 text-center flex flex-col items-center">
                      <div className="p-3 bg-white dark:bg-[#0f172a] rounded-full shadow-sm mb-2 border dark:border-white/5">
                        <UploadCloud className="h-8 w-8 text-blue-500" />
                      </div>
                      <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center items-center gap-1">
                        <label htmlFor="file-upload" className="cursor-pointer font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                          <span>Click to upload</span>
                          <input id="file-upload" type="file" className="sr-only" ref={fileInputRef} onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSelectedFile(e.target.files[0]);
                              setTextClaim('');
                            }
                          }} />
                        </label>
                        <p>or drag and drop a screenshot</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 font-medium tracking-wide">PNG, JPG up to 10MB</p>
                      {selectedFile && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-3 inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border dark:border-blue-800/30 text-sm font-semibold rounded-full">
                          {selectedFile.name}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full relative overflow-hidden flex justify-center items-center h-16 rounded-2xl shadow-lg text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-80 transition-all transform active:translate-y-0"
                  >
                    <AnimatePresence mode="popLayout">
                      {loading ? (
                        <motion.span
                          key={loadingStep}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-3 absolute"
                        >
                          <Loader2 className="animate-spin w-6 h-6" /> {LOADING_STEPS[loadingStep]}
                        </motion.span>
                      ) : (
                        <motion.span key="btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute">
                          Engage Radar
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </motion.div>

              {/* Results Area */}
              <AnimatePresence>
                {result && !loading && (
                  <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                    <AnalysisResultView result={result} />
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div layout className="pt-20 pb-8 text-center text-gray-400 dark:text-gray-600 font-medium text-sm">
          Built for GDG x DELL Ideathon
        </motion.div>
      </div>
    </div>
  );
}
