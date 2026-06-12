import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, Repeat2, Share, Zap, X } from 'lucide-react';
import { AnalysisResultView, type AnalysisPayload } from './AnalysisResult';

const MOCK_POSTS = [
  {
    id: 1,
    author: 'Mars Explorer',
    handle: '@marsexplorer',
    avatar: 'https://i.pravatar.cc/150?img=12',
    content: "NASA just found a city on Mars! 🔴 The footage is being hidden from the public!! #MarsCity #NASA",
    time: "1h",
    hasForwardedTag: true,
  },
  {
    id: 2,
    author: 'Aarav Kumar',
    handle: '@aaravK',
    avatar: 'https://i.pravatar.cc/150?img=11',
    content: "नमक के पानी से गरारे करने से कोरोना ठीक हो जाता है",
    time: "3h",
  },
  {
    id: 3,
    author: 'TechCorp',
    handle: '@TechCorp',
    avatar: 'https://i.pravatar.cc/150?img=8',
    content: "TechCorp releases its latest sustainability report, aiming to recycle 1 billion tech products by 2030. 🌱💻",
    time: "5h",
  }
];

export function FeedSimulator() {
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [results, setResults] = useState<Record<number, AnalysisPayload>>({});

  const handleRadarAnalyze = async (post: typeof MOCK_POSTS[0]) => {
    if (results[post.id]) return; 
    
    setAnalyzingId(post.id);
    try {
      const formData = new FormData();
      formData.append('text', post.content);
      const res = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResults(prev => ({ ...prev, [post.id]: data }));
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend");
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8 text-center bg-blue-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-blue-800 dark:text-blue-300 rounded-2xl p-4 shadow-sm">
        <h3 className="font-bold text-lg mb-1 flex items-center justify-center gap-2"><Zap className="w-5 h-5"/> Live Social Feed</h3>
        <p className="text-sm opacity-90">Click the Radar icon on any suspicious post to invoke the Fact-Checking Copilot.</p>
      </div>

      <AnimatePresence>
        {MOCK_POSTS.map((post, i) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden hover:shadow-lg dark:hover:shadow-black/50 transition-shadow duration-300"
          >
            <div className="p-6 flex gap-4">
              <img src={post.avatar} alt="avatar" className="w-12 h-12 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-bold text-slate-900 dark:text-white truncate">{post.author}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-sm truncate">{post.handle} · {post.time}</span>
                  </div>
                  <button 
                    onClick={() => handleRadarAnalyze(post)}
                    disabled={analyzingId === post.id || !!results[post.id]}
                    className="p-2.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white transition-all duration-300 disabled:opacity-50 group flex-shrink-0 shadow-sm"
                    title="Engage Radar Copilot"
                  >
                    {analyzingId === post.id ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                        <Zap className="w-5 h-5 fill-current" />
                      </motion.div>
                    ) : (
                      <Zap className="w-5 h-5" />
                    )}
                  </button>
                </div>
                
                {post.hasForwardedTag && (
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-500 mb-3 flex items-center gap-1.5 bg-amber-100 dark:bg-amber-500/10 inline-flex px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-500/20 animate-pulse dark:shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                    <Repeat2 className="w-3.5 h-3.5"/> Forwarded many times
                  </div>
                )}
                
                <p className="text-slate-800 dark:text-slate-200 text-lg leading-snug whitespace-pre-wrap font-sans mb-4 break-words">
                  {post.content}
                </p>
                
                <div className="flex justify-between text-slate-400 dark:text-slate-500 max-w-sm mt-3 border-t border-slate-100 dark:border-white/10 pt-4">
                  <MessageCircle className="w-5 h-5 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer transition-colors" />
                  <Repeat2 className="w-5 h-5 hover:text-green-500 dark:hover:text-green-400 cursor-pointer transition-colors" />
                  <Heart className="w-5 h-5 hover:text-red-500 dark:hover:text-red-400 cursor-pointer transition-colors" />
                  <Share className="w-5 h-5 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer transition-colors" />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {results[post.id] && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-50 dark:bg-slate-950/50 relative border-t border-slate-100 dark:border-white/10 shadow-inner dark:shadow-none"
                >
                  <div className="p-8">
                    <button 
                      onClick={() => {
                        const newRes = {...results}; delete newRes[post.id]; setResults(newRes);
                      }}
                      className="absolute top-4 right-4 p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-400 transition-colors z-10"
                    >
                      <X className="w-4 h-4"/>
                    </button>
                    <AnalysisResultView result={results[post.id]} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
