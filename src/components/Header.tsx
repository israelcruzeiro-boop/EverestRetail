import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { APP_CONFIG } from '@/config/appConfig';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/videocasts', label: 'EverCast' },
    { path: '/blog', label: 'Blog' },
  ];

  return (
    <header className="w-full bg-[#0B1220] border-b border-white/10 md:sticky md:top-0 md:z-50 py-4 px-4 transition-all" aria-label="Cabeçalho Principal">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Logo Section */}
          <Link to="/" className="flex items-center group">
            <img src="/logo.png" alt="Everest Logo" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" />
            <span className="text-lg font-black text-white tracking-tighter uppercase relative top-0.5 hidden sm:block -ml-2">
              Everest <span className="text-blue-500">Retail</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-full ${location.pathname === link.path
                  ? 'text-white bg-blue-600'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="w-px h-4 bg-white/10 mx-2"></div>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  to="/painel"
                  className="flex items-center gap-3 bg-white/5 border border-white/10 pl-4 pr-1 py-1 rounded-full hover:bg-white/10 transition-all group"
                >
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/90">Meu Painel</span>
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white hover:text-slate-900 transition-all shadow-lg shadow-blue-500/20"
              >
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile Profile Link - Simple standard */}
          <div className="md:hidden flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/painel" className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white border border-white/20 shadow-lg active:scale-95 transition-transform">
                {user?.name?.charAt(0) || 'U'}
              </Link>
            ) : (
              <Link to="/login" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10 active:scale-95 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}