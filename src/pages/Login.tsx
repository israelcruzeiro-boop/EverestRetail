import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { HubIcon } from '../components/Icons';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    login();
    navigate('/marketplace');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] bg-white p-10 rounded-2xl shadow-xl border border-slate-100"
      >
        <div className="flex flex-col items-center gap-4 mb-12">
          <div className="w-14 h-14 bg-[#0052cc] flex items-center justify-center rounded-xl shadow-lg shadow-[#0052cc]/20">
            <HubIcon className="text-white w-8 h-8" />
          </div>
          <div className="text-center">
            <h2 className="text-slate-900 text-lg font-bold tracking-tight uppercase mb-1">
              One Stop Shop ENT.
            </h2>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Acesse condições exclusivas
            </h1>
            <p className="text-slate-500 mt-3 max-w-[320px] mx-auto">
              Você só precisa criar conta para visualizar preços personalizados e contratar soluções.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleLogin}
            className="flex items-center justify-center gap-3 w-full h-14 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-bold text-slate-700"
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="w-5 h-5" 
            />
            Continuar com Google
          </button>
          
          <button 
            onClick={handleLogin}
            className="flex items-center justify-center gap-3 w-full h-14 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm font-bold text-slate-700"
          >
            <span className="text-[#00a4ef] text-xl">⊞</span>
            Continuar com Microsoft
          </button>

          <button 
            onClick={handleLogin}
            className="flex items-center justify-center gap-3 w-full h-14 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-sm font-bold"
          >
            <span className="text-xl"></span>
            Continuar com Apple
          </button>
        </div>

        <div className="flex items-center gap-4 my-8">
          <div className="h-px bg-slate-100 flex-1"></div>
          <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">ou</span>
          <div className="h-px bg-slate-100 flex-1"></div>
        </div>

        <button 
          onClick={handleLogin}
          className="w-full text-[#0052cc] font-bold text-sm hover:underline"
        >
          Entrar com e-mail corporativo
        </button>

        <p className="mt-12 text-center text-slate-400 text-xs leading-relaxed">
          Ao continuar, você concorda com nossos <br />
          <a href="#" className="underline">Termos de Uso</a> e <a href="#" className="underline">Política de Privacidade</a>.
        </p>
      </motion.div>
    </div>
  );
}
