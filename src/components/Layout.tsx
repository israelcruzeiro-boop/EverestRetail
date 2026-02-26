import { Outlet } from 'react-router-dom';
import Header from './Header';
import { APP_CONFIG } from '../config/appConfig';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#f5f7f8] flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
            © 2024 {APP_CONFIG.name}. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}