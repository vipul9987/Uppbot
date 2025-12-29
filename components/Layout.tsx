
import React from 'react';
import { db } from '../services/mockDatabase';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  const user = db.getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] relative font-['Outfit']">
      {/* Structural Background Accents */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] w-[800px] h-[800px] bg-orange-100/20 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0)', backgroundSize: '30px 30px' }}></div>
      </div>
      
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4 group cursor-pointer">
              <div className="bg-slate-900 p-2 rounded-lg shadow-sm group-hover:bg-orange-500 transition-all duration-300">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-[900] text-slate-900 tracking-tighter leading-none uppercase">upp<span className="text-orange-500">bot</span></span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 leading-none">Studio Core</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-8">
              <div className="hidden md:flex flex-col items-end border-r border-slate-200 pr-8">
                <span className="text-[11px] font-black text-slate-900 tracking-tight">{user?.email}</span>
                <span className="text-[8px] text-orange-500 font-black uppercase tracking-widest mt-0.5 italic">Verified Session</span>
              </div>
              <button
                onClick={onLogout}
                className="group relative px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-900 transition-all border border-transparent hover:border-slate-100 rounded-lg hover:bg-slate-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="flex-1">
        {children}
      </main>
      
      <footer className="bg-white py-12 border-t border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center space-x-3">
            <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em]">
              Status: <span className="text-slate-900">Encrypted</span>
            </p>
          </div>
          <p className="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">
            &copy; 2024 uppbot Technologies &bull; V4.8
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
