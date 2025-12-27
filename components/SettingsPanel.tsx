
import React from 'react';
import { ReaderSettings, Theme } from '../types';
import { Sun, Moon, Type, AlignJustify, X } from 'lucide-react';

interface SettingsPanelProps {
  settings: ReaderSettings;
  onUpdate: (newSettings: Partial<ReaderSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate, isOpen, onClose }) => {
  if (!isOpen) return null;

  const fontOptions = [
    { label: '现代黑体', value: '"PingFang SC", "Inter", system-ui, sans-serif' },
    { label: '雅致宋体', value: '"Songti SC", "Merriweather", serif' },
    { label: '霞鹜文楷', value: '"LXGW WenKai Screen", sans-serif' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#2D2D2D] rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] z-[70] transition-all duration-500 transform translate-y-0 border-t border-gray-100 dark:border-white/5 animate-in slide-in-from-bottom-20">
      <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mt-4 mb-6 cursor-pointer" onClick={onClose}></div>
      
      <div className="px-8 pb-12 space-y-10 max-h-[80vh] overflow-y-auto hide-scrollbar">
        
        {/* Appearance / Brightness */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 text-gray-400">
            <Sun size={20} className={settings.brightness < 100 ? 'text-gray-300' : 'text-primary'} />
            <input 
              type="range" 
              min="50" 
              max="150" 
              value={settings.brightness}
              onChange={(e) => onUpdate({ brightness: Number(e.target.value) })}
              className="w-full h-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <Moon size={20} className={settings.theme === Theme.DARK ? 'text-primary' : 'text-gray-300'} />
          </div>
          
          <div className="flex justify-center gap-8">
             <button 
              onClick={() => onUpdate({ theme: Theme.LIGHT })}
              className={`group flex flex-col items-center gap-2 transition-all`}
            >
              <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${settings.theme === Theme.LIGHT ? 'border-primary bg-slate-100 shadow-inner' : 'border-gray-200 dark:border-zinc-800 text-gray-300'}`}>
                <Sun size={24} className={settings.theme === Theme.LIGHT ? 'text-primary' : ''} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${settings.theme === Theme.LIGHT ? 'text-primary' : 'text-gray-400'}`}>浅色模式</span>
             </button>
             <button 
              onClick={() => onUpdate({ theme: Theme.DARK })}
              className={`group flex flex-col items-center gap-2 transition-all`}
            >
              <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${settings.theme === Theme.DARK ? 'border-primary bg-[#1A1A1A] shadow-inner' : 'border-gray-200 dark:border-zinc-800 text-gray-300'}`}>
                <Moon size={24} className={settings.theme === Theme.DARK ? 'text-primary' : ''} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${settings.theme === Theme.DARK ? 'text-primary' : 'text-gray-400'}`}>深色模式</span>
             </button>
          </div>
        </div>

        <div className="h-px bg-gray-100 dark:bg-zinc-800/40" />

        {/* Font Family */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
            <Type size={16} />
            <span>字体样式</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
            {fontOptions.map((font) => (
              <button
                key={font.label}
                onClick={() => onUpdate({ fontFamily: font.value })}
                className={`px-5 py-3 rounded-xl text-sm whitespace-nowrap transition-all border ${
                  settings.fontFamily === font.value
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                    : 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-[#1A1A1A] dark:text-zinc-400 dark:border-zinc-800 hover:bg-gray-100'
                }`}
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size & Line Spacing Row */}
        <div className="grid grid-cols-2 gap-8">
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest">字号</span>
                <span className="text-primary font-black text-xs">{settings.fontSize}</span>
              </div>
              <div className="flex items-center gap-3">
                 <button 
                   className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#1A1A1A] text-gray-400 dark:text-zinc-600 flex items-center justify-center hover:bg-gray-100"
                   onClick={() => onUpdate({ fontSize: Math.max(12, settings.fontSize - 1) })}
                 >
                   <span className="text-[10px] font-bold">A-</span>
                 </button>
                 <input 
                  type="range" 
                  min="12" max="32" 
                  value={settings.fontSize}
                  onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
                  className="flex-1 h-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <button 
                   className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-[#1A1A1A] text-gray-400 dark:text-zinc-600 flex items-center justify-center hover:bg-gray-100"
                   onClick={() => onUpdate({ fontSize: Math.min(32, settings.fontSize + 1) })}
                 >
                   <span className="text-sm font-bold">A+</span>
                 </button>
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-widest">行距</span>
                <span className="text-primary font-black text-xs">{Math.round(settings.lineHeight * 10) / 10}</span>
              </div>
              <div className="flex items-center gap-3">
                <AlignJustify size={14} className="text-gray-400" />
                <input 
                  type="range" 
                  min="1" max="2.5" step="0.1"
                  value={settings.lineHeight}
                  onChange={(e) => onUpdate({ lineHeight: Number(e.target.value) })}
                  className="flex-1 h-1 bg-gray-100 dark:bg-[#1A1A1A] rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsPanel;
