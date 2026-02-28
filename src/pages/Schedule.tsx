import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabaseService } from '@/lib/supabaseService';
import { ArrowLeftIcon } from '@/components/Icons';
import { AdminProduct } from '@/types/admin';
import { analytics } from '@/lib/analytics';

export default function Schedule() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<AdminProduct | null>(null);

  useEffect(() => {
    const load = async () => {
      const all = await supabaseService.getProducts();
      const found = all.find(p => p.id === id);
      if (found) {
        setProduct(found);
        analytics.track('schedule_started', { productId: found.id });
      }
    };
    load();
  }, [id]);

  const handleConfirm = () => {
    if (product) analytics.track('schedule_confirmed', { productId: product.id });
    alert('Sessão agendada com sucesso estratégico.');
    navigate('/marketplace');
  };

  if (!product) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 relative overflow-hidden flex items-center justify-center py-16 px-4">
      {/* Liquid Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 45, 0],
            x: [0, 30, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[20%] w-[35%] h-[35%] bg-blue-400/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, -50, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] right-[10%] w-[45%] h-[45%] bg-sky-400/10 rounded-full blur-[130px]"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-xl w-full relative z-10"
      >
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate(-1)}
          className="mb-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition-all flex items-center gap-3 group"
        >
          <span className="bg-white p-2 rounded-full shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </span>
          Retornar
        </motion.button>

        <div className="bg-white/40 backdrop-blur-3xl border border-white p-2 rounded-[48px] shadow-2xl shadow-blue-500/5">
          <div className="bg-white p-10 md:p-12 rounded-[44px] border border-slate-100/50 shadow-inner relative overflow-hidden">
            <div className="absolute top-8 right-8 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shadow-blue-500/30">
              !
            </div>

            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6 block w-fit">
              Alinhamento Estratégico
            </span>

            <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-[-0.03em] mb-8">
              Agendar<br />
              <span className="bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent text-6xl">Sessão</span>
            </h2>

            <div className="py-8 border-y border-slate-100 mb-8 group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Solução Alvo</p>
              <p className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{product.name}</p>
            </div>

            <p className="text-slate-500 font-medium mb-12 leading-relaxed text-sm">
              Você está prestes a reservar um horário exclusivo de alinhamento tático para integrar esta tecnologia ao seu modelo de negócio.
            </p>

            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-7 rounded-[28px] text-sm uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-600/20"
            >
              Confirmar Reunião
            </motion.button>
          </div>
        </div>

        <p className="text-center mt-8 text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">
          ENT SOLUTIONS · AGENDAMENTO INTELIGENTE
        </p>
      </motion.div>
    </div>
  );
}