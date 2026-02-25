import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { analytics } from '../lib/analytics';
import { useEffect } from 'react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    analytics.track('page_view');
  }, []);

  const handleLogin = () => {
    analytics.track('login');
    login();
    navigate('/marketplace');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[480px] bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
        <div className="flex flex-col items-center gap-6 mb-12">
          <img src="/logo.png" alt="ENT Logo" className="h-12 w-auto object-contain" />
          <h1 className="text-3xl font-black text-slate-900 text-center tracking-tight">Acesse condições exclusivas</h1>
        </div>
        <button onClick={handleLogin} className="flex items-center justify-center gap-3 w-full h-14 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-bold">Continuar com Apple</button>
      </motion.div>
    </div>
  );
}