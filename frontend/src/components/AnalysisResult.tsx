import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, ChevronDown, ShieldAlert, Globe, Link as LinkIcon } from 'lucide-react';
import { CircularGauge } from './CircularGauge';
import confetti from 'canvas-confetti';

interface Evidence {
  id: string;
  text: string;
  source: string;
  distance: number;
}

export interface AnalysisPayload {
  claim: string;
  stance: 'Supported' | 'Refuted' | 'Uncertain';
  confidence: number;
  reasoning: string;
  evidence: Evidence[];
  metadata_audit?: string;
  english_claim?: string;
  english_reasoning?: string;
}

const StanceIcon = ({ stance }: { stance: string }) => {
  if (stance === 'Supported') return <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-500" />;
  if (stance === 'Refuted') return <XCircle className="w-16 h-16 text-red-600 dark:text-red-500" />;
  return <AlertTriangle className="w-16 h-16 text-yellow-500 dark:text-yellow-400" />;
};

export function AnalysisResultView({ result }: { result: AnalysisPayload }) {
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (result.stance === 'Supported' && result.confidence >= 0.90) {
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22c55e', '#16a34a', '#86efac']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22c55e', '#16a34a', '#86efac']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [result]);



  const getStanceColor = () => {
    if (result.stance === 'Supported') return "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50 text-green-900 dark:text-green-100 dark:shadow-[0_0_30px_rgba(34,197,94,0.15)]";
    if (result.stance === 'Refuted') return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-500/50 text-red-900 dark:text-red-100 dark:shadow-[0_0_30px_rgba(239,68,68,0.25)]";
    return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/50 text-yellow-900 dark:text-yellow-100 dark:shadow-[0_0_30px_rgba(234,179,8,0.10)]";
  };

  const displayClaim = showTranslation && result.english_claim ? result.english_claim : result.claim;
  const displayReasoning = showTranslation && result.english_reasoning ? result.english_reasoning : result.reasoning;
  const hasTranslation = !!result.english_claim;

  const handleTranslateClick = () => {
    if (!showTranslation) {
      setIsTranslating(true);
      setTimeout(() => {
        setIsTranslating(false);
        setShowTranslation(true);
      }, 500);
    } else {
      setShowTranslation(false);
    }
  };

  return (
    <motion.div layout className="space-y-6 w-full relative z-10">
      {/* Verdict Hero - Stagger 1 */}
      <motion.div 
        layout
        className={`p-6 sm:p-8 rounded-3xl border flex flex-col items-center sm:items-start sm:flex-row gap-6 sm:gap-8 ${getStanceColor()} transition-colors duration-500`}
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex-shrink-0 bg-white dark:bg-[#0f172a] p-4 rounded-full shadow-sm border dark:border-white/5">
          <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", delay: 0.2 }}>
            <StanceIcon stance={result.stance} />
          </motion.div>
        </div>
        
        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-4xl font-extrabold uppercase tracking-wider">{result.stance}</h2>
            {hasTranslation && (
               <button 
                 onClick={handleTranslateClick}
                 disabled={isTranslating}
                 className={`inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 dark:bg-[#0f172a] hover:bg-white dark:hover:bg-slate-800 border dark:border-white/10 rounded-full text-sm font-semibold transition shadow-sm text-gray-800 dark:text-gray-300 ${isTranslating ? 'animate-pulse opacity-70' : ''}`}
               >
                 <Globe className="w-4 h-4" /> {isTranslating ? "Translating..." : (showTranslation ? "Show Original" : "Translate to EN")}
               </button>
             )}
          </div>
          
          <p className="text-xl font-medium opacity-90 leading-relaxed italic border-l-4 pl-4 border-current">
             "{displayClaim}"
          </p>
          
          {result.metadata_audit && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4 bg-white/70 dark:bg-red-950/40 rounded-xl p-4 flex items-start gap-3 border shadow-sm text-red-900 dark:text-red-300 border-red-200 dark:border-red-900/40">
              <ShieldAlert className="w-6 h-6 flex-shrink-0 text-red-600 dark:text-red-400" />
              <div className="text-sm text-left">
                <span className="font-bold uppercase tracking-wide block mb-1 text-red-700 dark:text-red-400">Forensic Warning</span>
                <span className="opacity-90 leading-tight block">{result.metadata_audit}</span>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Trust Gauge */}
        <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#0f172a] border dark:border-white/5 rounded-2xl shadow-sm text-current">
          <CircularGauge value={result.confidence * 100} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-70">Trust Score</span>
          <span className="text-[9px] font-mono mt-1 opacity-50">Forensic Scan: 243ms</span>
        </div>
      </motion.div>

      {/* Reasoning Accordion - Stagger 2 */}
      <motion.div 
        layout 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.15 }}
        className="bg-white dark:bg-[#0f172a] rounded-3xl shadow-lg border border-gray-100 dark:border-white/10 overflow-hidden dark:shadow-black/50"
      >
        <button 
          onClick={() => setReasoningOpen(!reasoningOpen)}
          className="w-full flex items-center justify-between p-6 text-left focus:outline-none hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">AI Reasoning</h3>
          <motion.div animate={{ rotate: reasoningOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-6 h-6 text-gray-500 dark:text-gray-400" />
          </motion.div>
        </button>
        <AnimatePresence>
          {reasoningOpen && (
            <motion.div
              layout
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-6 pb-6 text-gray-700 dark:text-gray-300 text-lg leading-relaxed border-t border-gray-100 dark:border-white/10 pt-4"
            >
              {displayReasoning}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Evidence Cards - Stagger 3 */}
      <motion.div 
        layout 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 0.3 }}
        className="pt-4"
      >
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 px-2 flex items-center gap-3">
          <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-1.5 rounded-lg text-sm border dark:border-blue-800/30">Top</span>
          Supporting Evidence
        </h3>
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {result.evidence.map((ev, idx) => {
              const relevance = Math.max(0, Math.min(100, Math.round((2.0 - ev.distance) / 2.0 * 100)));
              return (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.4 + idx * 0.1, type: "spring", stiffness: 100 }}
                  className="bg-white dark:bg-[#0f172a] p-6 rounded-3xl shadow-md border border-gray-100 dark:border-white/10 flex flex-col justify-between hover:shadow-xl dark:shadow-black/50 dark:hover:shadow-black/70 hover:-translate-y-1 transition-all duration-300"
                >
                  <div>
                    <div className="mb-5 inline-block">
                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-full uppercase tracking-widest border dark:border-white/5">
                         <LinkIcon className="w-3 h-3" />
                         {ev.source}
                       </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-300 text-[15px] mb-6 leading-relaxed italic border-l-4 border-gray-200 dark:border-slate-700 pl-4 break-words">
                      "{ev.text}"
                    </p>
                  </div>
                  <div className="mt-auto bg-gray-50 dark:bg-slate-900/50 p-4 rounded-xl border dark:border-white/5">
                    <div className="flex justify-between text-[11px] text-gray-600 dark:text-gray-400 mb-2 font-bold uppercase tracking-wider">
                      <span>Relevance</span>
                      <span>{relevance}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${relevance}%` }}
                        transition={{ duration: 1, delay: 0.7 + idx * 0.1, ease: "easeOut" }}
                        className="h-full bg-blue-500 dark:bg-blue-500 rounded-full" 
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
