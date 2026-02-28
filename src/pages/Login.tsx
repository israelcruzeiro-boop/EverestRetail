import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { analytics } from '../lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '../config/appConfig';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    analytics.track('page_view');
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user;
      if (mode === 'login') {
        user = await login(email, password);
        analytics.track('login');
      } else {
        user = await signup(name, email, password);
        analytics.track('publication_request_created', { action: 'signup' });
      }

      // IMPORTANTE: Resetar loading ANTES de navegar
      setLoading(false);

      // Redirecionamento por Role
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/painel', { replace: true });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Erro ao autenticar. Verifique suas credenciais.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Black Top Accent - Unified with Branding */}
      <div className="bg-black h-48 md:h-64 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[80px]"></div>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-6 -mt-32 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-2 rounded-[48px] shadow-2xl border border-slate-100"
        >
          <div className="bg-white p-10 md:p-14 rounded-[44px] border border-slate-50 shadow-inner">
            <div className="flex flex-col items-center gap-8 mb-12 text-center">
              <Link to="/">
                <motion.img
                  whileHover={{ y: -2, scale: 1.05 }}
                  src={APP_CONFIG.logoPath}
                  alt={APP_CONFIG.name}
                  className="h-12 w-auto object-contain"
                />
              </Link>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Protocolo de Acesso</span>
                </div>
                <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight uppercase leading-none">
                  {mode === 'login' ? 'Ecossistema' : 'Início'}
                </h1>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  Acesse a inteligência estratégica do varejo moderno.
                </p>
              </div>
            </div>

            <div className="flex bg-slate-100/50 p-1.5 rounded-2xl mb-10 border border-slate-100">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'login' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-950'}`}
              >
                Entrar
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'signup' ? 'bg-white text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-950'}`}
              >
                Registrar
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-6">
              <AnimatePresence mode="wait">
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5 block">Nome Completo</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/5 focus:bg-white focus:border-cyan-500/30 outline-none transition-all text-sm font-bold shadow-sm"
                      placeholder="Identificação Everest"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5 block">E-mail Corporativo</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/5 focus:bg-white focus:border-cyan-500/30 outline-none transition-all text-sm font-bold shadow-sm"
                  placeholder="nome@corporativo.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-5 block">Senha de Acesso</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 px-6 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-cyan-500/5 focus:bg-white focus:border-cyan-500/30 outline-none transition-all text-sm font-bold shadow-sm"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest text-center bg-red-50/50 py-4 rounded-2xl border border-red-100">
                  {error}
                </p>
              )}

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className={`w-full h-16 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all shadow-xl shadow-black/20 hover:bg-cyan-500 hover:text-slate-900 ${loading ? 'opacity-50 cursor-wait' : ''}`}
              >
                {loading ? 'Validando...' : mode === 'login' ? 'Conectar' : 'Criar Conta'}
              </motion.button>
            </form>

            <footer className="mt-12 text-center">
              <p className="text-[9px] text-slate-300 font-extrabold uppercase tracking-[0.5em] leading-relaxed">
                SECURED BY ENT-PROTOCOL v2.25
              </p>
            </footer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}