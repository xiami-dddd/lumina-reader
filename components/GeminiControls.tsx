
import React, { useState } from 'react';
import { AppMode, AnalysisResult, HighlightConfig } from '../types';
import { Sparkles, BookOpen, FileText, ChevronUp, ChevronDown, CheckSquare, Square, Minimize2, Maximize2 } from 'lucide-react';

interface GeminiControlsProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
  isAnalyzing: boolean;
  analysisResult: AnalysisResult | null;
  highlightConfig: HighlightConfig;
  onConfigChange: (config: HighlightConfig) => void;
}

const GeminiControls: React.FC<GeminiControlsProps> = ({ 
  mode, 
  onModeChange, 
  isAnalyzing, 
  analysisResult,
  highlightConfig,
  onConfigChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  const toggleCategory = (key: keyof HighlightConfig) => {
    onConfigChange({
      ...highlightConfig,
      [key]: {
        ...highlightConfig[key],
        enabled: !highlightConfig[key].enabled
      }
    });
  };

  const updateColor = (key: keyof HighlightConfig, color: string) => {
    onConfigChange({
      ...highlightConfig,
      [key]: {
        ...highlightConfig[key],
        color
      }
    });
  };

  const getButtonClass = (buttonMode: AppMode) => {
    const isActive = mode === buttonMode;
    const base = "flex-1 py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ring-1";
    
    if (isActive) {
      return `${base} bg-slate-100 text-primary ring-slate-200/50 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700/30`;
    } else {
      return `${base} bg-gray-50 text-gray-500 ring-transparent dark:bg-[#1A1A1A] dark:text-zinc-600 hover:bg-gray-100 dark:hover:bg-zinc-800/50`;
    }
  };

  // 极简折叠态：仅显示一个半透明的小图标，完全不干扰阅读
  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className="ml-auto w-12 h-12 bg-white/40 dark:bg-black/20 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/40 dark:border-white/5 flex items-center justify-center text-primary/60 dark:text-zinc-400 hover:scale-110 active:scale-95 transition-all duration-500 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
        <Sparkles size={20} className="animate-pulse relative z-10" />
      </button>
    );
  }

  return (
    <div className="p-2 bg-white/95 dark:bg-[#2D2D2D] backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 space-y-2 relative animate-in slide-in-from-bottom-4 duration-500">
      
      {/* 折叠按钮 */}
      <button 
        onClick={() => setIsMinimized(true)}
        className="absolute -top-3 -right-3 w-7 h-7 bg-white dark:bg-zinc-800 rounded-full shadow-md border border-gray-100 dark:border-zinc-700 flex items-center justify-center text-gray-400 hover:text-primary transition-colors z-50"
        title="收起控制台"
      >
        <Minimize2 size={12} />
      </button>

      {/* Mode Selection */}
      <div className="flex gap-1.5 relative">
        <button 
          onClick={() => onModeChange(AppMode.STANDARD)}
          className={getButtonClass(AppMode.STANDARD)}
        >
          <BookOpen size={14} />
          阅读
        </button>
        <button 
          onClick={() => onModeChange(AppMode.NOVEL)}
          className={getButtonClass(AppMode.NOVEL)}
        >
          <Sparkles size={14} />
          小说
        </button>
        <button 
          onClick={() => onModeChange(AppMode.PAPER)}
          className={getButtonClass(AppMode.PAPER)}
        >
          <FileText size={14} />
          论文
        </button>
      </div>

      {/* Novel Mode Controls */}
      {mode === AppMode.NOVEL && !isAnalyzing && (
        <div className="px-2 py-2 space-y-2 bg-gray-50 dark:bg-[#1A1A1A]/50 rounded-xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between px-1">
             <span className="text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-widest">AI 标注解析</span>
          </div>
          
          {!analysisResult?.nouns ? (
             <div className="py-2 text-center">
                <p className="text-[10px] text-gray-300 dark:text-zinc-700 font-medium uppercase tracking-tighter">等待 AI 处理当前章节...</p>
             </div>
          ) : (
            <>
              <div className="flex items-center justify-between py-1">
                 <div 
                   className="flex items-center gap-2 cursor-pointer group"
                   onClick={() => toggleCategory('nouns')}
                 >
                    {highlightConfig.nouns.enabled ? 
                      <CheckSquare size={14} className="text-primary transition-transform group-active:scale-90" /> : 
                      <Square size={14} className="text-gray-300 dark:text-zinc-700 transition-transform group-active:scale-90" />
                    }
                    <span className={`text-[11px] font-bold ${highlightConfig.nouns.enabled ? 'text-gray-900 dark:text-zinc-200' : 'text-gray-400 dark:text-zinc-600'}`}>
                      核心名词
                    </span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: highlightConfig.nouns.color }}></div>
                    <input 
                      type="color" 
                      value={highlightConfig.nouns.color}
                      onChange={(e) => updateColor('nouns', e.target.value)}
                      className="w-4 h-4 rounded-full overflow-hidden border-0 p-0 bg-transparent cursor-pointer opacity-0 absolute"
                    />
                 </div>
              </div>

              <div className="flex items-center justify-between py-1">
                 <div 
                   className="flex items-center gap-2 cursor-pointer group"
                   onClick={() => toggleCategory('verbs')}
                 >
                    {highlightConfig.verbs.enabled ? 
                      <CheckSquare size={14} className="text-primary transition-transform group-active:scale-90" /> : 
                      <Square size={14} className="text-gray-300 dark:text-zinc-700 transition-transform group-active:scale-90" />
                    }
                    <span className={`text-[11px] font-bold ${highlightConfig.verbs.enabled ? 'text-gray-900 dark:text-zinc-200' : 'text-gray-400 dark:text-zinc-600'}`}>
                      动作描述
                    </span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: highlightConfig.verbs.color }}></div>
                    <input 
                      type="color" 
                      value={highlightConfig.verbs.color}
                      onChange={(e) => updateColor('verbs', e.target.value)}
                      className="w-4 h-4 rounded-full overflow-hidden border-0 p-0 bg-transparent cursor-pointer opacity-0 absolute"
                    />
                 </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Paper Mode Results */}
      {mode === AppMode.PAPER && analysisResult && (
        <div className="bg-amber-50 dark:bg-[#1A1A1A]/80 rounded-xl border border-amber-100 dark:border-white/5 overflow-hidden animate-in fade-in duration-500">
          <div 
             className="flex justify-between items-center px-3 py-2 cursor-pointer"
             onClick={() => setIsExpanded(!isExpanded)}
          >
             <h4 className="text-[10px] font-bold text-amber-800 dark:text-zinc-400 uppercase flex items-center gap-2">
                <Sparkles size={12} />
                AI 解析
             </h4>
             <button className="text-amber-700 dark:text-zinc-600">
                {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
             </button>
          </div>
          
          {isExpanded && (
            <div className="px-3 pb-3">
              <p className="text-xs text-amber-950 dark:text-zinc-300 mb-2 leading-relaxed">
                {analysisResult.summary || "正在分析内容..."}
              </p>
              <div className="flex flex-wrap gap-1">
                {analysisResult.keywords?.map((k, i) => (
                  <span key={i} className="text-[9px] font-bold px-2 py-0.5 bg-white dark:bg-[#2D2D2D] rounded text-amber-700 dark:text-zinc-500 border border-amber-100 dark:border-white/5">
                    #{k}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GeminiControls;
