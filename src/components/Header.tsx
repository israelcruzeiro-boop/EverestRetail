import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '@/config/appConfig';
import AnimatedCoinBadge from '@/components/AnimatedCoinBadge';

export default function Header() {
  const { isAuthenticated, isAdmin, user, logout, balance } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/blog', label: 'Blog' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-black backdrop-blur-xl border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center h-10 shrink-0 group">
          <motion.img
            whileHover={{ y: -2, scale: 1.05 }}
            src={APP_CONFIG.logoPath}
            alt={APP_CONFIG.name}
            className="h-full w-auto object-contain transition-all"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/10 backdrop-blur-lg shadow-2xl">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-sky-200 hover:bg-white/10 hover:text-orange-400 transition-all font-sans"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <>
              <Link
                to="/painel"
                className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-sky-200 hover:bg-white/10 hover:text-orange-400 transition-all font-sans"
              >
                Painel
              </Link>
              <Link
                to="/request-publication"
                className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-sky-200 hover:bg-white/10 hover:text-orange-400 transition-all font-sans"
              >
                Publicar
              </Link>
            </>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 hover:bg-cyan-500 hover:text-slate-950 transition-all font-black font-sans"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden sm:block">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-sm">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 rounded-xl border border-white/5 shadow-inner text-slate-300">
                  <AnimatedCoinBadge balance={balance} />
                  <div className="w-[1px] h-3 bg-white/10"></div>
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    {user?.name.split(' ')[0]}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={logout}
                  className="px-5 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-red-500 transition-all shadow-md"
                >
                  Sair
                </motion.button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-cyan-500 text-slate-950 px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-[0.3em] hover:bg-white transition-all shadow-lg shadow-cyan-500/20"
              >
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 bg-white/60 backdrop-blur-md text-slate-600 rounded-2xl border border-white shadow-sm hover:text-blue-600 transition-colors"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </motion.button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/80 backdrop-blur-2xl border-t border-slate-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-2">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link
                    to="/painel"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all"
                  >
                    Meu Painel
                  </Link>
                  <Link
                    to="/request-publication"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-2xl transition-all"
                  >
                    Solicitar Publicação
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 rounded-2xl transition-all"
                >
                  Administração
                </Link>
              )}
              {isAuthenticated && (
                <div className="mx-6 mb-4 flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Saldo Everest</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">🪙</span>
                    <span className="text-sm font-black text-slate-900">{balance}</span>
                  </div>
                </div>
              )}
              <div className="mt-4 p-4 bg-slate-50/50 rounded-[32px] flex flex-col gap-4 border border-white">
                {isAuthenticated ? (
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full bg-red-500 text-white py-5 text-xs font-black uppercase tracking-[0.4em] rounded-2xl shadow-lg shadow-red-500/20"
                  >
                    Encerrar Sessão
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center bg-blue-600 text-white py-5 text-xs font-black uppercase tracking-[0.4em] rounded-2xl shadow-lg shadow-blue-500/20"
                  >
                    Entrar Agora
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}