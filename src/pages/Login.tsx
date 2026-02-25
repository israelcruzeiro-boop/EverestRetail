import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { analytics } from '../lib/analytics';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
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
        user = await login(email);
        analytics.track('login');
      } else {
        user = await signup(name, email);
        analytics.track('publication_request_created', { action: 'signup' });
      }

      // Redirecionamento baseado em role
      if (user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/painel', { replace: true });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-[440px] bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-8 md:p-10">
          <div className="flex flex-col items-center gap-4 mb-10 text-center">
            <img src="/logo.png" alt="ENT Logo" className="h-10 w-auto object-contain" />
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
              </h1>
              <p className="text-sm text-slate-400 font-medium mt-1">
                Acesse o ecossistema estratégico do varejo.
              </p>
            </div>
          </div>

          <div className="flex bg-slate-50 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'login' ? 'bg-white text-[#1D4ED8] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Entrar
            </button>
            <button 
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mode === 'signup' ? 'bg-white text-[#1D4ED8] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white outline-none transition-all text-sm"
                    placeholder="Como devemos te chamar?"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">E-mail Corporativo</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white outline-none transition-all text-sm"
                placeholder="nome@empresa.com"
              />
            </div>

            {error && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-tight text-center">
                {error}
              </p>
            )}

            <button 
              disabled={loading}
              className={`w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:bg-slate-800 active:scale-[0.98] ${loading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {loading ? 'Processando...' : mode === 'login' ? 'Acessar Ecossistema' : 'Cadastrar agora'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
              Dica: Use <span className="text-slate-900">admin@email.com</span> para painel admin<br/>
              ou <span className="text-slate-900">user@email.com</span> para painel de usuário.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}