import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';
import { APP_CONFIG } from '@/config/appConfig';

export default function Layout() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-slate-50 border-t border-slate-100 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
            {APP_CONFIG.name} · PROTOCOLO ESTRATÉGICO DE VAREJO
          </p>
          <p className="text-slate-300 text-[9px] font-bold uppercase tracking-[0.2em] mt-6">
            © 2024 Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}