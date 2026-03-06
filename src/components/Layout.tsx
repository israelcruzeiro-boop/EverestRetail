import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import { APP_CONFIG } from '@/config/appConfig';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col relative pb-20 md:pb-0">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />
      <footer className="bg-slate-900 border-t border-white/5 py-14">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
            {APP_CONFIG.name} · PROTOCOLO ESTRATÉGICO DE VAREJO
          </p>
          <p className="text-slate-600 text-[9px] font-bold uppercase tracking-[0.2em] mt-6">
            © 2024 Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}