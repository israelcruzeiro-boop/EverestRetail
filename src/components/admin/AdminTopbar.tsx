import { ReactNode } from 'react';
import { useOutletContext } from 'react-router-dom';

interface AdminTopbarProps {
  title: string;
  actions?: ReactNode;
}

export default function AdminTopbar({ title, actions }: AdminTopbarProps) {
  const { setIsSidebarOpen } = useOutletContext<{ setIsSidebarOpen: (open: boolean) => void }>();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-slate-500 hover:text-[#0052cc] hover:bg-slate-50 rounded-lg transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span className="hidden sm:inline hover:text-[#0052cc] cursor-pointer transition-colors">Admin</span>
            <span className="hidden sm:inline mx-2 font-normal">/</span>
            <span className="text-slate-900">{title}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            {actions}
          </div>
          <div className="hidden sm:block h-6 w-px bg-slate-200 mx-2"></div>
          <button className="relative p-2 text-slate-500 hover:text-[#0052cc] hover:bg-slate-50 rounded-lg transition-all">
            <span className="text-lg md:text-xl">🔔</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
