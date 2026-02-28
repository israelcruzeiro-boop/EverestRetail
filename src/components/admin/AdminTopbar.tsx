import { ReactNode } from 'react';
import { useOutletContext } from 'react-router-dom';
import NotificationPopover from './NotificationPopover';

interface AdminTopbarProps {
  title: string;
  actions?: ReactNode;
}

export default function AdminTopbar({ title, actions }: AdminTopbarProps) {
  const { setIsSidebarOpen } = useOutletContext<{ setIsSidebarOpen: (open: boolean) => void }>();

  return (
    <header className="bg-white border-b-2 border-[#0B1220] sticky top-0 z-30 px-4 md:px-8 h-20 flex items-center">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-6 md:gap-12">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-3 bg-[#0B1220] text-white border-2 border-[#0B1220] hover:bg-white hover:text-[#0B1220] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center text-[10px] font-black text-[#0B1220] uppercase tracking-[0.3em]">
            <span className="hidden sm:inline hover:text-[#1D4ED8] cursor-pointer transition-colors">Sistema</span>
            <span className="hidden sm:inline mx-4 text-slate-300">/</span>
            <span className="bg-[#1D4ED8] text-white px-3 py-1">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {actions}
          </div>
          <div className="hidden sm:block h-10 w-0.5 bg-[#0B1220]/10 mx-4"></div>
          <NotificationPopover />
        </div>
      </div>
    </header>
  );
}
