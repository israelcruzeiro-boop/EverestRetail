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
            className={`md:hidden p-3 rounded-2xl border transition-colors backdrop-blur-md ${isMenuOpen
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
              }`}
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

      {/* Mobile Nav Overlay Premium Ultra Modern */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="md:hidden absolute top-full left-0 w-full bg-[#0B1220]/95 backdrop-blur-3xl border-t border-white/10 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] max-h-[calc(100vh-80px)] overflow-y-auto custom-cyber-scrollbar"
          >
            <div className="flex flex-col p-6 gap-3 relative">
              {/* Luz de Fundo Decorativa */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none"></div>

              <div className="space-y-1 relative z-10">
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-2xl transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {isAuthenticated && (
                <div className="space-y-1 relative z-10 pt-4 border-t border-white/5">
                  <span className="px-6 text-[9px] font-black uppercase tracking-widest text-slate-600 mb-2 block">Painel do Usuário</span>
                  <Link
                    to="/painel"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-300 hover:text-emerald-400 hover:bg-white/5 rounded-2xl transition-all"
                  >
                    Meu Painel
                  </Link>
                  <Link
                    to="/request-publication"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-slate-300 hover:text-emerald-400 hover:bg-white/5 rounded-2xl transition-all"
                  >
                    Solicitar Publicação
                  </Link>
                </div>
              )}

              {isAdmin && (
                <div className="pt-2 relative z-10">
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex justify-between items-center px-6 py-4 text-xs font-black uppercase tracking-[0.3em] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl transition-all hover:bg-cyan-500/20"
                  >
                    Administração Elite
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse outline outline-2 outline-cyan-500/30"></div>
                  </Link>
                </div>
              )}

              {isAuthenticated && (
                <div className="mt-2 flex items-center justify-between p-5 bg-gradient-to-br from-[#121A2A] to-[#0A0F18] rounded-[24px] border border-white/5 shadow-inner relative z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-yellow-500/5 blur-xl pointer-events-none"></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Saldo</span>
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 rounded-xl border border-white/10 relative z-10 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                    <span className="text-base">🪙</span>
                    <span className="text-base font-black text-white tabular-nums">{balance}</span>
                  </div>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-white/5 flex flex-col gap-4 relative z-10">
                {isAuthenticated ? (
                  <button
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full bg-red-500/10 text-red-500 border border-red-500/20 py-5 text-xs font-black uppercase tracking-[0.4em] rounded-[24px] hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20 active:scale-95"
                  >
                    Encerrar Sessão
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center bg-cyan-500 text-slate-950 py-5 text-xs font-black uppercase tracking-[0.4em] rounded-[24px] hover:bg-white transition-all shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-95"
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