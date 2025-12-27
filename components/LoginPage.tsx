
import React, { useState } from 'react';
import { Mail, MessageCircle, Key, ArrowLeft, Loader2 } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<'CHOICE' | 'EMAIL'>('CHOICE');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLoginAction = () => {
    setIsLoggingIn(true);
    // 模拟登录延迟
    setTimeout(() => {
      setIsLoggingIn(false);
      onLogin();
    }, 800);
  };

  const Logo = () => (
    <div className="flex flex-col items-center mb-12 select-none">
      <div className="relative mb-6 flex items-center justify-center">
        {/* 替换为 ZCOOL 字体文本 */}
        <h1 className="text-[80px] font-zcool text-[#3D3939] leading-none tracking-tight">
          登录
        </h1>
        
        {/* 简约装饰线 */}
        <div className="absolute -bottom-4 w-16 h-1 bg-[#3D3939]/10 rounded-full"></div>
      </div>
      <div className="flex flex-col items-center gap-1">
        <p className="text-gray-400 text-[11px] font-bold tracking-[0.4em] uppercase">Private Library</p>
        <p className="text-gray-300 text-[10px] font-medium tracking-widest mt-1">欢迎开启您的阅读之旅</p>
      </div>
    </div>
  );

  return (
    <div className="h-full w-full bg-[#FAF9F6] flex flex-col items-center justify-center px-10 relative overflow-hidden font-sans">
      
      {/* 装饰性柔光背景 */}
      <div className="absolute top-[-5%] left-[-5%] w-80 h-80 bg-primary/5 rounded-full blur-[80px]"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-orange-200/10 rounded-full blur-[80px]"></div>

      <div className="w-full max-w-sm z-10 animate-in fade-in zoom-in-95 duration-1000">
        <Logo />

        {view === 'CHOICE' ? (
          <div className="space-y-4 w-full">
            <button 
              onClick={() => setView('EMAIL')}
              className="w-full py-4 px-6 bg-[#F2F2F2] text-gray-700 rounded-[2rem] flex items-center justify-center gap-3 font-bold transition-all hover:bg-gray-200 active:scale-95 border border-transparent"
            >
              <Mail size={18} strokeWidth={2.5} className="text-primary" />
              <span className="text-sm tracking-wide">login with email</span>
            </button>
            
            <button 
              onClick={handleLoginAction}
              className="w-full py-4 px-6 bg-[#F2F2F2] text-gray-700 rounded-[2rem] flex items-center justify-center gap-3 font-bold transition-all hover:bg-gray-200 active:scale-95"
            >
              <MessageCircle size={18} fill="currentColor" className="text-green-500" />
              <span className="text-sm tracking-wide">login with wechat</span>
            </button>

            <div className="pt-12 text-center">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                Didn’t have account ? <span className="text-primary cursor-pointer hover:underline">Sign up</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5 w-full animate-in slide-in-from-right-8 duration-500">
            <div className="space-y-4">
               <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60">
                    <Mail size={16} />
                  </div>
                  <input 
                    type="email" 
                    placeholder="Email Address" 
                    className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-300 text-gray-700 transition-all shadow-sm"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60">
                    <Key size={16} />
                  </div>
                  <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full pl-14 pr-6 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-300 text-gray-700 transition-all shadow-sm"
                  />
                </div>
            </div>

            <button 
              onClick={handleLoginAction}
              disabled={isLoggingIn}
              className="w-full py-4 bg-[#2D2D2D] text-white rounded-[2rem] font-bold shadow-lg shadow-black/10 flex items-center justify-center gap-2 hover:bg-black active:scale-95 transition-all"
            >
              {isLoggingIn ? <Loader2 size={18} className="animate-spin" /> : <span className="tracking-wide uppercase text-xs">Login</span>}
            </button>

            <div className="pt-6 flex flex-col items-center gap-6">
              <button 
                onClick={() => setView('CHOICE')} 
                className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] hover:text-primary transition-colors py-2"
              >
                <ArrowLeft size={12} strokeWidth={3} /> 返回选择
              </button>
              
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.1em] opacity-60">
                Forgot Password ? <span className="text-gray-600 hover:text-primary cursor-pointer">Click Here</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 底部页脚 */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center opacity-20">
         <div className="flex items-center gap-2">
            <div className="w-8 h-[1px] bg-gray-400"></div>
            <span className="text-[9px] font-black tracking-[0.5em] uppercase text-gray-500">Lumina Reader</span>
            <div className="w-8 h-[1px] bg-gray-400"></div>
         </div>
      </div>
    </div>
  );
};

export default LoginPage;
