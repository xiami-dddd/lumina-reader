
import React, { useState, useEffect, useRef } from 'react';
import { Settings, ChevronLeft, MoreHorizontal, X, Loader2, BookOpen, Sparkles, Eye, Play, Pause, SkipBack, SkipForward, Zap } from 'lucide-react';
import { AppMode, Theme, ReaderSettings, AnalysisResult, Book, HighlightConfig } from '../types';
import SettingsPanel from './SettingsPanel';
import GeminiControls from './GeminiControls';
import { analyzeContent, explainTerm, applyNovelHighlights } from '../services/geminiService';

interface ReaderProps {
  book: Book;
  onBack: () => void;
}

interface TermDefinition {
  term: string;
  type: 'proper' | 'hotword' | 'noun' | 'verb' | 'adj';
  definition: string | null;
  loading: boolean;
}

const Reader: React.FC<ReaderProps> = ({ book, onBack }) => {
  const [content, setContent] = useState(book.content);
  const [mode, setMode] = useState<AppMode>(AppMode.STANDARD);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 18,
    lineHeight: 1.6,
    fontFamily: '"LXGW WenKai Screen", sans-serif',
    theme: Theme.LIGHT,
    brightness: 100,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [highlightConfig, setHighlightConfig] = useState<HighlightConfig>({
    nouns: { enabled: true, color: '#F97316' }, // 修改为亮橙色
    verbs: { enabled: false, color: '#3B82F6' },
    adjectives: { enabled: false, color: '#A855F7' }
  });

  const [selectedTerm, setSelectedTerm] = useState<TermDefinition | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusSentences, setFocusSentences] = useState<string[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  // Speed in characters per second
  const [charsPerSecond, setCharsPerSecond] = useState(5); 
  const [focusColor, setFocusColor] = useState('rgba(16, 24, 39, 0.05)'); 
  
  const activeSentenceRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const playbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const focusColors = [
    { bg: 'rgba(16, 24, 39, 0.05)', active: '#101827' },
    { bg: 'rgba(59, 130, 246, 0.1)', active: '#3B82F6' },
    { bg: 'rgba(16, 185, 129, 0.1)', active: '#10B981' },
    { bg: 'rgba(168, 85, 247, 0.1)', active: '#A855F7' },
  ];

  useEffect(() => {
    if (settings.theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    const runAnalysis = async () => {
      setSelectedTerm(null);
      if (mode === AppMode.STANDARD) {
        setAnalysisResult(null);
        return;
      }
      setIsAnalyzing(true);
      try {
        const result = await analyzeContent(content, mode);
        setAnalysisResult(result);
      } catch (error) {
        console.error("Analysis failed", error);
      } finally {
        setIsAnalyzing(false);
      }
    };
    runAnalysis();
  }, [mode, content]);

  useEffect(() => {
    if (mode === AppMode.NOVEL && analysisResult?.nouns) {
      const html = applyNovelHighlights(
        content.substring(0, 4500), 
        analysisResult.nouns || [], 
        analysisResult.verbs || [], 
        analysisResult.adjectives || [],
        highlightConfig
      );
      setAnalysisResult(prev => prev ? { ...prev, annotatedHtml: html } : null);
    }
  }, [highlightConfig, mode, analysisResult?.nouns, content]);

  useEffect(() => {
    if (isFocusMode) {
      const sentences = content.match(/[^.!?。！？\n]+[.!?。！？\n]*/g) || [content];
      const cleanSentences = sentences.filter(s => s.trim().length > 0);
      setFocusSentences(cleanSentences);
    }
  }, [isFocusMode, content]);

  useEffect(() => {
    if (isFocusMode && isPlaying) {
      const currentSentence = focusSentences[focusIndex] || "";
      const msPerChar = 1000 / charsPerSecond;
      const duration = Math.max(1000, currentSentence.length * msPerChar);

      playbackTimeoutRef.current = setTimeout(() => {
        setFocusIndex((prev) => {
          if (prev >= focusSentences.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, duration);
    } else {
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
    }
    return () => {
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
    };
  }, [isFocusMode, isPlaying, focusIndex, charsPerSecond, focusSentences]);

  useEffect(() => {
    if (isFocusMode && activeSentenceRef.current) {
      activeSentenceRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [focusIndex, isFocusMode]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isFocusMode) return;
    const target = e.currentTarget;
    const progress = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    setReadingProgress(Math.min(100, Math.max(0, progress)));
  };

  const handleSettingsUpdate = (newSettings: Partial<ReaderSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleTextClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFocusMode || mode === AppMode.NOVEL) return;
    
    const target = e.target as HTMLElement;
    if (target.tagName === 'SPAN' && target.hasAttribute('data-term')) {
      const term = target.getAttribute('data-term') || '';
      const type = target.getAttribute('data-type') as any;
      if (!term) return;
      setSelectedTerm({ term, type, definition: null, loading: true });
      try {
        const explanation = await explainTerm(term, content.substring(0, 500));
        setSelectedTerm(prev => prev && prev.term === term ? { ...prev, definition: explanation, loading: false } : prev);
      } catch (error) {
        setSelectedTerm(prev => prev && prev.term === term ? { ...prev, definition: "加载失败", loading: false } : prev);
      }
    }
  };

  const getTermStyle = (type: string) => {
      switch(type) {
          case 'proper': return { color: '#92400E', bg: '#FEF3C7', label: '专有名词' };
          case 'hotword': return { color: '#075985', bg: '#E0F2FE', label: '重点概念' };
          case 'noun': return { color: highlightConfig.nouns.color, bg: highlightConfig.nouns.color + '20', label: '名词' };
          case 'verb': return { color: highlightConfig.verbs.color, bg: highlightConfig.verbs.color + '20', label: '动词' };
          case 'adj': return { color: highlightConfig.adjectives.color, bg: highlightConfig.adjectives.color + '20', label: '形容词' };
          default: return { color: '#6B7280', bg: '#F3F4F6', label: '词汇' };
      }
  };

  const containerStyle = {
    fontFamily: settings.fontFamily,
    fontSize: `${settings.fontSize}px`,
    lineHeight: settings.lineHeight,
    filter: `brightness(${settings.brightness}%)`,
    transition: 'background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1), color 0.8s cubic-bezier(0.4, 0, 0.2, 1), filter 0.3s ease',
  };

  return (
    <div className={`w-full h-full relative overflow-hidden flex flex-col transition-all duration-1000 ease-in-out ${settings.theme === Theme.LIGHT ? 'bg-[#FAF9F6]' : 'bg-[#1A1A1A]'}`}>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .playback-ui-dim { opacity: 0.15; filter: grayscale(0.8) blur(0.5px); transform: translateY(-5px); pointer-events: none; }
        .controller-compact { opacity: 0.45; filter: saturate(0.5); }
        .controller-compact:hover { opacity: 1; filter: saturate(1); }
        
        .dark input[type="range"].custom-slider::-webkit-slider-runnable-track {
          background: #2D2D2D;
          height: 3px;
          border-radius: 2px;
        }
        .dark input[type="range"].custom-slider::-webkit-slider-thumb {
          background: #52525B;
          border: 1px solid #1A1A1A;
          width: 10px;
          height: 10px;
          margin-top: -3.5px;
        }
        .speed-slider::-webkit-slider-thumb {
          background: #71717A !important;
          border: none !important;
          width: 8px !important;
          height: 8px !important;
          margin-top: -2.5px !important;
        }
      `}</style>

      {/* Header */}
      <header className={`flex justify-between items-center p-4 z-40 bg-inherit sticky top-0 backdrop-blur-md bg-opacity-90 transition-all duration-1000 ${isPlaying ? 'playback-ui-dim' : ''}`}>
        <button 
          onClick={() => isFocusMode ? setIsFocusMode(false) : onBack()}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2D2D2D] text-gray-800 dark:text-zinc-500 transition-colors"
        >
          {isFocusMode ? <X size={20} /> : <ChevronLeft size={24} />}
        </button>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsFocusMode(!isFocusMode)}
            className={`p-2 rounded-full transition-all duration-300 ${isFocusMode ? 'bg-zinc-800/10 dark:bg-zinc-200/10 text-zinc-800 dark:text-zinc-200' : 'hover:bg-gray-200 dark:hover:bg-[#2D2D2D] text-gray-800 dark:text-zinc-500'}`}
          >
            <Eye size={20} />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2D2D2D] text-gray-800 dark:text-zinc-500">
            <Settings size={20} />
          </button>
          {!isFocusMode && (
            <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-[#2D2D2D] text-gray-800 dark:text-zinc-500">
              <MoreHorizontal size={20} />
            </button>
          )}
        </div>
      </header>

      <main 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto scroll-smooth hide-scrollbar transition-all duration-700 ${isFocusMode ? 'px-0' : 'px-6 pb-24'}`}
        style={containerStyle}
        onClick={handleTextClick}
      >
        {!isFocusMode && (
          <div className={`mb-10 mt-2 pb-6 border-b transition-colors duration-1000 ${settings.theme === Theme.LIGHT ? 'border-gray-100' : 'border-[#2D2D2D]/40'}`}>
            <h1 className={`text-3xl font-bold mb-2 leading-tight tracking-tight transition-colors duration-1000 ${settings.theme === Theme.LIGHT ? 'text-gray-900' : 'text-zinc-200'}`}>
              {book.title}
            </h1>
            <p className={`text-sm font-medium uppercase tracking-widest transition-colors duration-1000 ${settings.theme === Theme.LIGHT ? 'text-gray-400' : 'text-zinc-600'}`}>
              {book.author}
            </p>
          </div>
        )}

        {isFocusMode ? (
          <div className="w-full py-[45vh]">
            {focusSentences.map((sentence, index) => {
              const isActive = index === focusIndex;
              return (
                <div 
                  key={index}
                  ref={isActive ? activeSentenceRef : null}
                  onClick={() => { setFocusIndex(index); setIsPlaying(false); }}
                  className={`
                    w-full transition-all duration-1000 ease-in-out cursor-pointer py-2 flex justify-center
                    ${isActive 
                      ? 'text-gray-900 dark:text-zinc-50' 
                      : 'text-gray-300 dark:text-[#2D2D2D] opacity-10'
                    }
                  `}
                  style={{ backgroundColor: isActive ? focusColor : 'transparent' }}
                >
                  <div className="w-full max-w-2xl px-12">
                     <p className={`m-0 p-0 text-left transition-all duration-700 ${isActive ? 'font-medium scale-100' : 'font-normal scale-100'}`}>
                        {sentence}
                     </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`transition-opacity duration-700 ${isAnalyzing ? 'opacity-40 blur-[1px]' : 'opacity-100'} text-gray-800 dark:text-zinc-200`}>
            {analysisResult?.annotatedHtml ? (
              <div dangerouslySetInnerHTML={{ __html: analysisResult.annotatedHtml }} />
            ) : (
              <div className="whitespace-pre-wrap">{content}</div>
            )}
          </div>
        )}
        <div className="h-40"></div>
      </main>

      {/* Term Modal */}
      {selectedTerm && !isFocusMode && (
        <div className="absolute inset-0 z-50 flex items-end justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/5 dark:bg-black/60 backdrop-blur-[2px] pointer-events-auto" onClick={() => setSelectedTerm(null)}></div>
          <div className="w-full max-w-[92%] sm:max-w-md m-4 mb-24 rounded-2xl shadow-2xl border border-white/50 dark:border-white/5 bg-white/95 dark:bg-[#2D2D2D] backdrop-blur-xl pointer-events-auto animate-in slide-in-from-bottom-5 overflow-hidden">
            <div className="px-6 pt-6 pb-2 flex justify-between items-start">
               <div className="flex flex-col gap-2">
                  {(() => {
                      const style = getTermStyle(selectedTerm.type);
                      return (
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full" style={{ color: style.color, backgroundColor: style.bg }}>
                                {style.label}
                            </span>
                        </div>
                      );
                  })()}
                  <h3 className="font-serif text-2xl font-bold text-gray-900 dark:text-zinc-200 leading-tight">{selectedTerm.term}</h3>
               </div>
               <button onClick={() => setSelectedTerm(null)} className="p-2 rounded-full bg-gray-100 dark:bg-zinc-800 dark:text-zinc-500">
                 <X size={16} />
               </button>
            </div>
            <div className="px-6 pb-8 pt-4">
                 {selectedTerm.loading ? (
                   <div className="flex flex-col gap-3 py-2 animate-pulse">
                     <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded w-full"></div>
                     <div className="h-2 bg-gray-100 dark:bg-zinc-800 rounded w-5/6"></div>
                   </div>
                 ) : (
                   <p className="text-base text-gray-700 dark:text-zinc-400 leading-relaxed font-sans">{selectedTerm.definition}</p>
                 )}
            </div>
          </div>
        </div>
      )}

      {/* Mode Controls */}
      {!isFocusMode && (
        <div className={`absolute bottom-16 left-4 right-4 z-30 transition-all duration-700 ${selectedTerm ? 'translate-y-24 opacity-0' : 'translate-y-0 opacity-100'}`}>
          <GeminiControls 
             mode={mode}
             onModeChange={setMode}
             isAnalyzing={isAnalyzing}
             analysisResult={analysisResult}
             highlightConfig={highlightConfig}
             onConfigChange={setHighlightConfig}
          />
        </div>
      )}

      {/* Focus Playback UI */}
      {isFocusMode && (
         <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-1000 ${isPlaying ? 'controller-compact' : 'opacity-100'}`}>
           <div className="bg-white/90 dark:bg-[#1E1E1E]/95 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/5 px-2 py-2 flex items-center gap-2 ring-1 ring-black/5 dark:ring-white/5">
              <div className="flex items-center gap-0.5">
                {!isPlaying && (
                  <button onClick={() => setFocusIndex(prev => Math.max(0, prev - 1))} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-zinc-200 rounded-xl transition-all">
                    <SkipBack size={14} fill="currentColor" />
                  </button>
                )}
                <button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-md transition-all transform hover:scale-105 active:scale-95 ${isPlaying ? 'bg-zinc-100 dark:bg-[#2D2D2D] text-zinc-900 dark:text-zinc-100' : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'}`}
                >
                  {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                </button>
                {!isPlaying && (
                  <button onClick={() => setFocusIndex(prev => Math.min(focusSentences.length - 1, prev + 1))} className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-zinc-200 rounded-xl transition-all">
                    <SkipForward size={14} fill="currentColor" />
                  </button>
                )}
              </div>
              {!isPlaying && (
                <>
                  <div className="w-px h-6 bg-gray-200/60 dark:bg-zinc-800/60 mx-1"></div>
                  <div className="flex items-center gap-3 pr-2">
                    <div className="flex items-center gap-1.5">
                       {focusColors.map((c, i) => (
                         <button 
                           key={i}
                           onClick={() => setFocusColor(c.bg)}
                           className={`w-3.5 h-3.5 rounded-lg transition-all border-2 ${focusColor === c.bg ? 'border-zinc-400 dark:border-zinc-500 scale-110' : 'border-transparent opacity-40 hover:opacity-100'}`}
                           style={{ backgroundColor: c.active }}
                         />
                       ))}
                    </div>
                    
                    <div className="w-px h-6 bg-gray-200/60 dark:bg-zinc-800/60"></div>
                    
                    {/* Speed Control Tool */}
                    <div className="flex items-center gap-2 group min-w-[80px]">
                      <div className="flex flex-col items-start">
                         <span className="text-[7px] font-black text-gray-400 dark:text-zinc-500 uppercase leading-none mb-0.5 tracking-tighter">Speed</span>
                         <span className="text-[9px] font-bold text-gray-600 dark:text-zinc-400 leading-none whitespace-nowrap">{charsPerSecond}<span className="text-[7px] ml-0.5">字/秒</span></span>
                      </div>
                      <input 
                        type="range" 
                        min="2" 
                        max="15" 
                        step="1"
                        value={charsPerSecond}
                        onChange={(e) => setCharsPerSecond(Number(e.target.value))}
                        className="speed-slider w-10 h-0.5 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-zinc-800 accent-zinc-500"
                      />
                    </div>
                  </div>
                </>
              )}
           </div>
         </div>
      )}

      {/* Footer Progress */}
      {!isFocusMode && (
        <div className={`absolute bottom-0 left-0 right-0 px-6 py-2 border-t z-10 bg-inherit backdrop-blur-md bg-opacity-95 flex flex-col justify-center h-14 gap-1 transition-all duration-1000 ${settings.theme === Theme.LIGHT ? 'border-gray-200' : 'border-[#2D2D2D]/20'} ${isPlaying ? 'opacity-0 translate-y-10' : 'opacity-100'}`}>
           <div className="flex justify-between items-center mb-0.5">
              <span className="text-[10px] text-gray-400 dark:text-zinc-600 font-bold uppercase tracking-[0.2em] truncate max-w-[150px]">{book.author}</span>
              <span className="text-[10px] text-gray-400 dark:text-zinc-600 font-mono">
                {Math.round(readingProgress)}%
              </span>
           </div>
           <input 
             type="range" 
             className="progress-slider w-full h-1 rounded-full appearance-none cursor-pointer bg-gray-200 dark:bg-[#2D2D2D] accent-primary" 
             value={readingProgress} 
             readOnly
           />
        </div>
      )}

      {isSettingsOpen && (
        <div className="absolute inset-0 z-[60] bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsSettingsOpen(false)}></div>
      )}
      <SettingsPanel settings={settings} onUpdate={handleSettingsUpdate} isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default Reader;
