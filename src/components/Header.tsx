import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HubIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Novidades' },
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/request-publication', label: 'Publicar' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <HubIcon className="text-[#1D4ED8] w-7 h-7" />
          <h1 className="text-xl font-black tracking-tighter text-[#0B1220]">
            ENT<span className="text-[#1D4ED8]">.</span>
          </h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#1D4ED8] transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link 
              to="/admin" 
              className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#1D4ED8] transition-colors"
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            {isAuthenticated ? (
              <button 
                onClick={logout}
                className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors"
              >
                Sair
              </button>
            ) : (
              <Link 
                to="/login"
                className="bg-[#1D4ED8] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#1D4ED8]/90 transition-colors"
              >
                Entrar
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-[#1D4ED8] transition-colors"
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map(link => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-bold uppercase tracking-wider text-[#0B1220]"
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-sm font-bold uppercase tracking-wider text-[#0B1220]"
                >
                  Admin
                </Link>
              )}
              <div className="pt-4 border-t border-slate-100">
                {isAuthenticated ? (
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="w-full text-left text-sm font-bold text-red-500 uppercase tracking-widest"
                  >
                    Sair da conta
                  </button>
                ) : (
                  <Link 
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-center bg-[#1D4ED8] text-white py-3 rounded-xl font-bold"
                  >
                    Entrar
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