import React, { useState, useRef } from 'react';
import { ArrowLeft, BookOpen, Upload, FileText, Loader2, User } from 'lucide-react';
import { Book } from '../types';
import { parseDocument } from '../services/geminiService';

interface ImportPageProps {
  onSave: (book: Book) => void;
  onCancel: () => void;
  existingBooks: Book[];
}

interface PaletteColor {
  hex: string;
  family: string;
  weight: number; 
}

const ImportPage: React.FC<ImportPageProps> = ({ onSave, onCancel, existingBooks }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('正在解析文档...');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 视觉审美色库 (Equilibrated Multi-Color Palette):
   * 权重设计：五大彩色系（权重 12）一致且远高于沙灰色系（权重 1）。
   */
  const colorPalette: PaletteColor[] = [
    // --- 1. 蓝色系 (Blue Family) - 权重 12 ---
    { hex: '#4A6993', family: 'blue', weight: 12 }, // 石板蓝
    { hex: '#7D8597', family: 'blue', weight: 12 }, // 蓝灰
    { hex: '#CDE0EB', family: 'blue', weight: 12 }, // 浅空蓝
    
    // --- 2. 绿色系 (Green Family) - 权重 12 ---
    { hex: '#2B6D69', family: 'green', weight: 12 }, // 深青
    { hex: '#5E7A77', family: 'green', weight: 12 }, // 灰青
    { hex: '#8F9491', family: 'green', weight: 12 }, // 鼠尾草绿

    // --- 3. 粉色系 (Pink Family) - 权重 12 ---
    { hex: '#BD688D', family: 'pink', weight: 12 }, // 绛紫
    { hex: '#B2A4A1', family: 'pink', weight: 12 }, // 胭脂灰
    { hex: '#D2B3B1', family: 'pink', weight: 12 }, // 灰粉

    // --- 4. 橙红色系 (Orange-Red Family) - 权重 12 ---
    { hex: '#D0604B', family: 'orange-red', weight: 12 }, // 红陶
    { hex: '#E78C45', family: 'orange-red', weight: 12 }, // 琥珀
    { hex: '#D68C78', family: 'orange-red', weight: 12 }, // 浅陶土

    // --- 5. 黄色/暖调系 (Yellow Family) - 权重 12 ---
    { hex: '#FCAB47', family: 'yellow', weight: 12 }, // 暖橙
    { hex: '#F9B966', family: 'yellow', weight: 12 }, // 金橙
    { hex: '#EDD043', family: 'yellow', weight: 12 }, // 黄绿

    // --- 6. 沙灰色系 (Sand-Gray Family) - 极低权重 1 ---
    { hex: '#DECBA5', family: 'sand-gray', weight: 1 }, // 核心色
    { hex: '#E6D5B8', family: 'sand-gray', weight: 1 }, // 暖沙
    { hex: '#E0D0BC', family: 'sand-gray', weight: 1 }, // 柔米灰
  ];

  const heights = ['h-[85%]', 'h-[90%]', 'h-[95%]', 'h-full', 'h-[88%]'];

  const getRandomDistinctColor = () => {
    // 获取书架上最后两本书，以确保新生成的书不与它们的色系重复
    const lastBook = existingBooks.length > 0 ? existingBooks[existingBooks.length - 1] : null;
    const secondLastBook = existingBooks.length > 1 ? existingBooks[existingBooks.length - 2] : null;
    
    const excludedFamilies = new Set<string>();
    
    if (lastBook) {
      const lastColorInfo = colorPalette.find(c => c.hex.toUpperCase() === lastBook.coverColor.toUpperCase());
      if (lastColorInfo) excludedFamilies.add(lastColorInfo.family);
    }
    
    if (secondLastBook) {
      const secondLastColorInfo = colorPalette.find(c => c.hex.toUpperCase() === secondLastBook.coverColor.toUpperCase());
      if (secondLastColorInfo) excludedFamilies.add(secondLastColorInfo.family);
    }

    // 1. 过滤掉最近两本书使用的色系
    let candidates = colorPalette.filter(c => !excludedFamilies.has(c.family));
    
    // 如果过滤后没候选了（理论上 6 个色系过滤 2 个还剩 4 个，不会发生），退回到全集
    if (candidates.length === 0) candidates = colorPalette;

    // 2. 加权随机选择
    const totalWeight = candidates.reduce((sum, color) => sum + color.weight, 0);
    let randomNum = Math.random() * totalWeight;
    
    for (const color of candidates) {
      if (randomNum < color.weight) {
        return color.hex;
      }
      randomNum -= color.weight;
    }
    
    return candidates[0].hex;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    const newBook: Book = {
      id: Date.now().toString(),
      title,
      author: author || '本地导入',
      content,
      coverColor: getRandomDistinctColor(),
      height: heights[Math.floor(Math.random() * heights.length)]
    };

    onSave(newBook);
  };

  const getMimeType = (file: File) => {
    if (file.type) return file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'application/pdf';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt': return 'text/plain';
      default: return 'application/octet-stream';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingMsg('正在准备文件...');
    
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        try {
          setProcessingMsg('AI 正在深度解析文档...');
          const mimeType = getMimeType(file);
          const result = await parseDocument(base64String, mimeType);
          
          setContent(result.content);
          setTitle(result.title !== "Unknown Title" ? result.title : title);
          setAuthor(result.author !== "Unknown Author" ? result.author : "");
        } catch (error) {
          console.error(error);
          alert("AI 解析失败，可能是由于文档过大或加密。您可以尝试复制粘贴文字。");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full w-full bg-white flex flex-col font-wenkai">
      <header className="p-4 border-b border-gray-100 flex items-center gap-4">
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">导入新书</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto hide-scrollbar">
        
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">书名</label>
            <input 
              type="text" 
              placeholder="书籍标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold border-none focus:ring-0 outline-none p-0 placeholder-gray-200 bg-transparent"
              autoFocus
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">作者</label>
            <div className="flex items-center gap-2 border-b border-gray-100 pb-1">
              <User size={14} className="text-gray-300" />
              <input 
                type="text" 
                placeholder="作者姓名"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full text-lg font-medium border-none focus:ring-0 outline-none p-0 placeholder-gray-200 bg-transparent"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
           <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept=".pdf,.docx,.txt"
             onChange={handleFileUpload}
           />
           <button 
             type="button"
             onClick={() => fileInputRef.current?.click()}
             disabled={isProcessing}
             className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-slate-50 hover:bg-slate-100/50 text-primary rounded-2xl text-sm font-bold transition-all border border-slate-100"
           >
             {isProcessing ? <Loader2 size={18} className="animate-spin"/> : <Upload size={18} />}
             {isProcessing ? "AI 解析中..." : "上传 PDF / Word / TXT"}
           </button>
           <p className="text-[10px] text-gray-400 text-center uppercase tracking-wider font-medium">
             由 Gemini 3 提供智能文档识别技术
           </p>
        </div>

        <div className="space-y-2 flex-1 flex flex-col relative min-h-[200px]">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">内容预览</label>
          <textarea 
            placeholder="在此输入或粘贴内容..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-primary/10 outline-none resize-none text-base leading-relaxed text-gray-700"
            required
          />
          {isProcessing && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center rounded-2xl z-20 transition-all duration-500">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Loader2 className="animate-spin text-primary" size={48} strokeWidth={1.5} />
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                </div>
                <div className="flex flex-col items-center">
                   <span className="text-sm font-bold text-gray-800 tracking-wide animate-pulse">{processingMsg}</span>
                   <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Lumina Intelligence</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <button 
          type="submit"
          disabled={!title || !content || isProcessing}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 ${(!title || !content || isProcessing) ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' : 'bg-primary text-white hover:bg-black shadow-black/10'}`}
        >
          <BookOpen size={20} />
          加入书架
        </button>

      </form>
    </div>
  );
};

export default ImportPage;