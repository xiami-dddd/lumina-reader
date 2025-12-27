
import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { Plus, Trash2, X, Check, BookMarked, Library, User, AlertCircle } from 'lucide-react';

interface ShelfProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onImportClick: () => void;
  onDeleteBook: (id: string) => void;
}

const Shelf: React.FC<ShelfProps> = ({ books, onSelectBook, onImportClick, onDeleteBook }) => {
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (books.length === 0) setIsDeleteMode(false);
  }, [books.length]);

  const handleBookClick = (book: Book) => {
    if (isDeleteMode) {
      setBookToDelete(book);
    } else {
      onSelectBook(book);
    }
  };

  const confirmDelete = () => {
    if (bookToDelete) {
      const id = bookToDelete.id;
      setBookToDelete(null);
      // 先触发本地消失动画
      setRemovingId(id);
      // 动画结束后正式通知父组件移除
      setTimeout(() => {
        onDeleteBook(id);
        setRemovingId(null);
      }, 400);
    }
  };

  return (
    <div className="h-full w-full bg-[#FAF9F6] flex flex-col overflow-hidden relative font-sans">
      
      {/* 极简页头 */}
      <header className="pt-10 pb-2 flex justify-between items-center z-20 px-10">
        <div className="flex flex-col">
          <h2 className="text-xl font-zcool text-gray-900 uppercase tracking-wider">阅界</h2>
          <div className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">
            Library / {books.length.toString().padStart(2, '0')}
          </div>
        </div>
        
        <button 
          onClick={() => setIsDeleteMode(!isDeleteMode)}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
            isDeleteMode ? 'text-white bg-red-500 shadow-lg shadow-red-200 rotate-0' : 'text-gray-300 hover:text-black hover:bg-gray-100'
          }`}
        >
          {isDeleteMode ? <X size={18} strokeWidth={2.5} /> : <Trash2 size={18} strokeWidth={2.5} />}
        </button>
      </header>

      {/* 书架区域 */}
      <div className="flex-1 flex flex-col justify-center relative px-10">
        <div className="h-[380px] w-full flex items-end justify-start gap-[5px] sm:gap-[8px] pb-[1px] overflow-x-auto hide-scrollbar">
          {books.map((book, idx) => {
            const isRemoving = removingId === book.id;
            // 随机化抖动起始点，让效果更自然
            const wiggleDelay = `${(idx * 0.05).toFixed(2)}s`;
            const widthClasses = ['w-[48px]', 'w-[56px]', 'w-[64px]', 'w-[60px]', 'w-[52px]'];
            const width = widthClasses[idx % widthClasses.length];
            
            return (
              <div 
                key={book.id}
                onClick={() => handleBookClick(book)}
                className={`
                  relative cursor-pointer transition-all duration-500 origin-bottom flex-shrink-0
                  ${book.height || 'h-[85%]'} ${width} rounded-sm
                  ${isDeleteMode ? 'animate-wiggle' : 'hover:-translate-y-6 hover:brightness-105 active:scale-95'}
                  ${isRemoving ? 'animate-pop-out' : ''}
                  shadow-[3px_0_10px_rgba(0,0,0,0.08)]
                `}
                style={{ 
                  backgroundColor: book.coverColor,
                  animationDelay: isDeleteMode ? wiggleDelay : '0s'
                }}
              >
                <div className="absolute inset-0 bg-white/5 pointer-events-none opacity-20 mix-blend-overlay"></div>
                <div className="absolute left-[3px] top-0 bottom-0 w-[1px] bg-black/10"></div>
                <div className="absolute left-[4px] top-0 bottom-0 w-[1px] bg-white/5"></div>

                <div className="absolute inset-0 flex items-center justify-center p-2.5 z-10 overflow-hidden">
                  <h3 
                    className={`
                      font-black leading-none tracking-tighter text-center uppercase transition-opacity duration-300
                      ${book.title.length > 5 ? 'text-[12px]' : 'text-[16px]'}
                      ${isDeleteMode ? 'opacity-40' : 'opacity-85'}
                    `}
                    style={{ 
                      writingMode: 'vertical-rl', 
                      textOrientation: 'mixed',
                      color: 'rgba(0, 0, 0, 0.22)',
                      textShadow: '0.5px 0.5px 1px rgba(255,255,255,0.15), -0.5px -0.5px 1px rgba(0,0,0,0.25)', 
                    }}
                  >
                    {book.title}
                  </h3>
                </div>

                <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center opacity-30">
                  <span className="text-[7px] font-bold text-white tracking-[0.2em] uppercase">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                </div>

                {isDeleteMode && !isRemoving && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-0 duration-300 z-30 ring-2 ring-white">
                    <X size={14} strokeWidth={4} />
                  </div>
                )}
              </div>
            );
          })}

          {books.length === 0 && (
            <div className="w-full h-full flex flex-col items-center justify-center opacity-10 animate-in fade-in duration-1000">
               <BookMarked size={64} strokeWidth={1} />
               <p className="text-[10px] font-black tracking-[0.5em] uppercase mt-4">Empty Shelf</p>
            </div>
          )}
        </div>
        
        {books.length > 0 && (
          <div className="w-full h-[2px] bg-gray-400/20 rounded-full mt-2"></div>
        )}
      </div>

      {/* 底部导航栏 */}
      <div className="bg-[#EAEAEA] h-24 flex items-center justify-between px-20 relative border-t border-gray-300/10">
        <div className="flex flex-col items-center group cursor-pointer transition-all">
           <div className="mb-1 text-gray-400 group-hover:text-black group-hover:scale-110 transition-all duration-300">
              <Library size={20} strokeWidth={2.5} />
           </div>
           <span className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 group-hover:text-black group-hover:-translate-y-0.5 transition-all duration-300">书架</span>
        </div>

        <button 
          onClick={onImportClick}
          disabled={isDeleteMode}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.25)] -translate-y-6 hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-500 group border-[4px] border-[#F2F2F2] ${isDeleteMode ? 'bg-gray-300 grayscale opacity-50 cursor-not-allowed' : 'bg-gray-900'}`}
        >
          <Plus size={26} className="text-white" strokeWidth={3} />
        </button>

        <div className="flex flex-col items-center group cursor-pointer transition-all">
           <div className="mb-1 text-gray-400 group-hover:text-black group-hover:scale-110 transition-all duration-300">
              <User size={20} strokeWidth={2.5} />
           </div>
           <span className="text-[10px] font-black tracking-[0.2em] uppercase text-gray-400 group-hover:text-black group-hover:-translate-y-0.5 transition-all duration-300">用户</span>
        </div>
      </div>

      {/* 删除确认弹窗 - 优化动效 */}
      {bookToDelete && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-8 bg-black/5 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-[300px] bg-white rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                <AlertCircle size={32} strokeWidth={1.5} />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-zcool text-gray-900 mb-2">移除书籍</h3>
              <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-8 leading-relaxed">
                确定要将 <span className="text-red-500 font-bold">"{bookToDelete.title}"</span><br/>从您的收藏中移除吗？
              </p>
              <div className="space-y-3">
                <button 
                  onClick={confirmDelete}
                  className="w-full py-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-red-600 active:scale-95 transition-all shadow-lg shadow-red-100"
                >
                  Confirm Delete
                </button>
                <button 
                  onClick={() => setBookToDelete(null)}
                  className="w-full py-4 bg-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-gray-200 active:scale-95 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes wiggle {
          0% { transform: rotate(-0.8deg) scale(0.98); }
          50% { transform: rotate(0.8deg) scale(0.98); }
          100% { transform: rotate(-0.8deg) scale(0.98); }
        }
        @keyframes popOut {
          0% { transform: scale(0.98) rotate(0); opacity: 1; }
          40% { transform: scale(1.1) rotate(5deg); opacity: 1; }
          100% { transform: scale(0) rotate(-20deg); opacity: 0; }
        }
        .animate-wiggle {
          animation: wiggle 0.35s ease-in-out infinite;
        }
        .animate-pop-out {
          animation: popOut 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          z-index: 50;
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Shelf;
