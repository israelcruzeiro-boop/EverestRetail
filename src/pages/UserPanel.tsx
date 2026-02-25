import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function UserPanel() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-slate-100"
      >
        <span className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full mb-6 inline-block">
          Conta {user?.role}
        </span>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Olá, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mb-10 leading-relaxed max-w-lg">
          Bem-vindo ao seu painel estratégico. Aqui você poderá acompanhar suas solicitações e acessar conteúdos exclusivos em breve.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-2">Meus Pedidos</h3>
            <p className="text-xs text-slate-400">Você ainda não possui contratações ativas.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-2">Agendamentos</h3>
            <p className="text-xs text-slate-400">Nenhum horário marcado para esta semana.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}