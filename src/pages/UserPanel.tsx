import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function UserPanel() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <span className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-4 inline-block">
              Conta {user?.role}
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Olá, {user?.name.split(' ')[0]}
            </h1>
            <p className="text-slate-500 mt-2 leading-relaxed max-w-lg">
              Bem-vindo ao seu painel estratégico. Gerencie suas soluções e solicitações aqui.
            </p>
          </div>
          
          <Link 
            to="/request-publication"
            className="inline-flex items-center justify-center bg-[#1D4ED8] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1D4ED8]/90 transition-all shadow-lg shadow-[#1D4ED8]/20"
          >
            Solicitar Publicação
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-2">Meus Pedidos</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Status: Vazio</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-2">Agendamentos</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Próximos: Nenhum</p>
          </div>
          <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-[#1D4ED8] mb-2">Seja um Parceiro</h3>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Tem uma solução para o varejo? Envie para análise.
              </p>
            </div>
            <Link to="/request-publication" className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-widest mt-4 hover:underline">
              Saiba mais →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}