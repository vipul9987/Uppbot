
import React, { useState } from 'react';
import { UserRole } from '../types';
import { db } from '../services/mockDatabase';

interface AuthScreenProps {
  onLogin: (u: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [activeTab, setActiveTab] = useState<UserRole>(UserRole.DESIGNER);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (activeTab === UserRole.ADMIN && !adminKey) {
       setError("Admin access requires authorization.");
       return;
    }
    
    setError(null);
    setLoading(true);
    
    setTimeout(() => {
      try {
        const user = db.login(email, activeTab, adminKey);
        onLogin(user);
      } catch (err: any) {
        setError(err.message || "An error occurred.");
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const btnStyle = "w-full py-4 px-4 text-[10px] font-black rounded-lg text-white bg-slate-900 hover:bg-orange-500 transition-all uppercase tracking-[0.2em] shadow-sm active:scale-[0.98] disabled:bg-slate-300";

  return (
    <div className="min-h-screen flex bg-white font-['Outfit'] overflow-hidden">
      {/* Left Panel: Auth Form */}
      <div className="w-full lg:w-[480px] flex flex-col p-8 md:p-16 border-r border-slate-100 z-10 bg-white shadow-2xl">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="mb-12 flex flex-col items-center">
             <div className="bg-slate-900 p-2.5 rounded-lg shadow-sm mb-6 group hover:bg-orange-500 transition-colors duration-300">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
             </div>
             <h1 className="text-2xl font-[900] text-slate-900 tracking-tighter uppercase">
                upp<span className="text-orange-500">bot</span>
             </h1>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Access Portal</h2>
            <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-widest">Identify your credentials</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-center space-x-3 text-red-600 animate-bounce">
               <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 relative">
               <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                className="block w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm"
              />
            </div>

            {activeTab === UserRole.ADMIN && (
              <input
                type="password"
                required
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="ADMIN KEY"
                className="block w-full px-5 py-4 bg-orange-50/50 border-2 border-orange-200 rounded-lg text-[11px] font-bold text-slate-900 focus:border-orange-500 outline-none transition-all placeholder:text-orange-400 animate-in slide-in-from-top-2"
              />
            )}

            <div className="relative">
               <input
                type={showPassword ? "text" : "password"}
                placeholder="PASSWORD"
                className="block w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-lg text-[11px] font-bold text-slate-900 focus:border-orange-500 focus:bg-white outline-none transition-all placeholder:text-slate-300 shadow-sm"
              />
               <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
               </button>
            </div>

            <button type="submit" disabled={loading} className={btnStyle}>
              {loading ? "AUTHENTICATING..." : "INITIATE LOGIN"}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px]"><span className="px-4 bg-white text-slate-300 font-black uppercase">Switch Mode</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
               onClick={() => setActiveTab(UserRole.DESIGNER)}
               className={`py-3.5 px-4 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === UserRole.DESIGNER ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'}`}
            >
              DESIGNER
            </button>
            <button 
               onClick={() => setActiveTab(UserRole.ADMIN)}
               className={`py-3.5 px-4 border rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === UserRole.ADMIN ? 'border-slate-900 bg-slate-900 text-white shadow-md' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-300'}`}
            >
              ADMIN
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: Penji-Style Creative Illustration */}
      <div className="hidden lg:flex flex-1 bg-slate-950 relative overflow-hidden items-center justify-center">
         {/* Animated Background Elements */}
         <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-600/20 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
         
         {/* Studio Graphics Layer */}
         <div className="relative w-full h-full flex items-center justify-center p-20">
            <div className="relative w-full max-w-2xl aspect-[1.4/1] bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm p-12 overflow-hidden shadow-2xl">
               {/* Grid Pattern */}
               <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
               
               {/* Center Focus */}
               <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
                  <div className="mb-8 p-4 bg-orange-500 rounded-lg shadow-[0_0_30px_rgba(249,115,22,0.4)] animate-bounce duration-[3000ms]">
                     <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                     </svg>
                  </div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Elite Verification</h3>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest max-w-xs mx-auto leading-relaxed opacity-60">
                     Precision automated skill matching for the top 1% creative tier.
                  </p>
               </div>

               {/* Floating Artifacts (Penji Style) */}
               
               {/* Artifact 1: Layer Panel */}
               <div className="absolute top-10 right-10 w-32 bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-md animate-[float_4s_ease-in-out_infinite]">
                  <div className="h-1 w-12 bg-orange-500/50 rounded-full mb-2"></div>
                  <div className="space-y-2">
                     {[1,2,3].map(i => <div key={i} className="h-1 w-full bg-white/5 rounded-full"></div>)}
                  </div>
               </div>

               {/* Artifact 2: Color Swatch */}
               <div className="absolute bottom-12 left-12 flex space-x-2 animate-[float_5s_ease-in-out_infinite_reverse]">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg shadow-lg"></div>
                  <div className="w-8 h-8 bg-white/20 rounded-lg"></div>
                  <div className="w-8 h-8 bg-slate-900 rounded-lg"></div>
               </div>

               {/* Artifact 3: Vector Node */}
               <div className="absolute top-1/4 left-8 animate-[float_6s_ease-in-out_infinite]">
                  <svg className="w-16 h-16 text-orange-500/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                     <path d="M12 4L20 12L12 20L4 12L12 4Z" />
                     <circle cx="12" cy="4" r="2" fill="currentColor" />
                     <circle cx="20" cy="12" r="2" fill="currentColor" />
                     <circle cx="12" cy="20" r="2" fill="currentColor" />
                     <circle cx="4" cy="12" r="2" fill="currentColor" />
                  </svg>
               </div>

               {/* Artifact 4: Typography Block */}
               <div className="absolute bottom-10 right-12 bg-white rounded-lg p-4 shadow-2xl rotate-3 scale-90 opacity-90 animate-[float_3s_ease-in-out_infinite]">
                  <span className="text-2xl font-black text-slate-900 leading-none block uppercase tracking-tighter">Aa</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mt-1">Inter / Black</span>
               </div>
            </div>
         </div>
         
         {/* CSS Floating Animation */}
         <style>{`
            @keyframes float {
               0%, 100% { transform: translateY(0px) rotate(var(--tw-rotate, 0deg)); }
               50% { transform: translateY(-20px) rotate(var(--tw-rotate, 0deg)); }
            }
         `}</style>
      </div>
    </div>
  );
};

export default AuthScreen;
