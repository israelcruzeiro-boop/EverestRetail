import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabaseService';
import { ArrowLeftIcon, CheckIcon } from '@/components/Icons';
import { AdminProduct } from '@/types/admin';
import { analytics } from '@/lib/analytics';
import { productReviewsRepo } from '@/lib/repositories/productReviewsRepo';

export default function Checkout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<AdminProduct | null>(null);

  useEffect(() => {
    const load = async () => {
      const all = await supabaseService.getProducts();
      const found = all.find(p => p.id === id);
      if (found) {
        setProduct(found);
        analytics.track('checkout_started', { productId: found.id, priceCents: found.priceCents });
      }
    };
    load();
  }, [id]);

  const handleConfirm = async () => {
    if (product) {
      analytics.track('checkout_confirmed', { productId: product.id, priceCents: product.priceCents });
      const success = await productReviewsRepo.recordHire(product.id);

      if (!success) {
        alert('Erro ao registrar contratação no sistema. Por favor, verifique sua conexão ou contate o suporte.');
        return;
      }
    }
    alert('Contratação confirmada com sucesso estratégico.');
    navigate('/marketplace');
  };

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Black Header Header - Minimal for Checkout */}
      <div className="bg-black pt-16 md:pt-24 pb-32 px-4 relative overflow-hidden border-b border-white/5">
        <div className="max-w-2xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Processamento Seguro ENT-CORE</span>
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
            Finalizar <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Contratação</span>
          </h2>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-16 pb-20 relative z-20">
        {/* Back Link - Positioned above card */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-cyan-400 transition-all flex items-center gap-3 group"
        >
          <span className="bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/10 group-hover:bg-white/20 transition-colors">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </span>
          <span className="text-white/60 group-hover:text-white transition-colors">Retornar ao Produto</span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-slate-50 border border-slate-100 p-2 rounded-[48px] shadow-2xl"
        >
          <div className="bg-white p-10 md:p-14 rounded-[44px] border border-white shadow-inner">
            {/* Order Details */}
            <div className="space-y-10">
              <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Solução Selecionada</p>
                  <p className="text-4xl font-extrabold text-slate-900 mb-8 tracking-tight">{product.name}</p>

                  <div className="flex items-center justify-between pt-8 border-t border-slate-200">
                    <div>
                      <div className="flex flex-col mt-2">
                        {product.originalPriceCents && product.originalPriceCents > product.priceCents && (
                          <span className="text-sm font-bold text-red-500 line-through mb-1">
                            De: R$ {(product.originalPriceCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        )}
                        <p className={`text-5xl font-black tracking-tighter ${product.originalPriceCents ? 'text-green-600' : 'text-cyan-600'}`}>
                          {product.originalPriceCents ? 'Por: ' : ''}R$ {(product.priceCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-5 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                        {product.billingPeriod === 'yearly' ? 'Anual' : 'Mensal'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-start gap-6 p-8 bg-cyan-500/5 rounded-[32px] border border-cyan-500/10">
                <div className="w-12 h-12 bg-cyan-500 text-slate-950 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-600 leading-relaxed">
                  Operação protegida pelo protocolo governamental ENT. A implantação desta tecnologia será iniciada imediatamente após o provisionamento dos recursos.
                </p>
              </div>

              {/* Action */}
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                className="w-full bg-black hover:bg-cyan-500 hover:text-slate-950 text-white font-black py-8 rounded-[32px] text-sm uppercase tracking-[0.4em] transition-all shadow-2xl shadow-black/20 flex items-center justify-center gap-4"
              >
                Confirmar Operação Strategos
              </motion.button>
            </div>
          </div>
        </motion.div>

        <div className="mt-12 flex items-center justify-center gap-6">
          <span className="h-[1px] flex-1 bg-slate-200"></span>
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] whitespace-nowrap">
            SECURED BY ENT-PROTOCOL
          </p>
          <span className="h-[1px] flex-1 bg-slate-200"></span>
        </div>
      </div>
    </div>
  );
}