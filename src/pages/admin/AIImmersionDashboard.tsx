import { useState, useEffect } from 'react';
import AdminTopbar from '../../components/admin/AdminTopbar';
import StatCard from '../../components/admin/StatCard';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

export default function AIImmersionDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    page_view: 0,
    click_buy: 0,
    click_location: 0,
    click_whatsapp: 0
  });

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tracking_imersao')
        .select('event');

      if (data) {
        const counts = data.reduce((acc: any, curr: any) => {
          acc[curr.event] = (acc[curr.event] || 0) + 1;
          return acc;
        }, {
          page_view: 0,
          click_buy: 0,
          click_location: 0,
          click_whatsapp: 0
        });
        setMetrics(counts);
      }
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const totalInteractions = metrics.click_buy + metrics.click_location + metrics.click_whatsapp;
  const engagementRate = metrics.page_view > 0 ? Math.round((totalInteractions / metrics.page_view) * 100) : 0;
  const inactivityRate = 100 - engagementRate;
  const purchaseIntention = metrics.page_view > 0 ? Math.round((metrics.click_buy / metrics.page_view) * 100) : 0;

  const showInsights = metrics.page_view > 0;

  return (
    <>
      <AdminTopbar title="Métricas Imersão IA" />
      <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-8 border-orange-500 pl-6 mb-12">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-[#0B1220]">Desempenho da Landing Page</h2>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Acompanhamento de tráfego e conversão em tempo real</p>
          </div>
          <button 
            onClick={loadMetrics}
            className="px-6 py-2 bg-[#0B1220] text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-colors"
          >
            Atualizar Dados
          </button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center border-4 border-[#0B1220] bg-white">
            <div className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse text-[#0B1220]">Processando Eventos...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              label="Visitantes"
              value={metrics.page_view}
              icon="👁️"
              color="blue"
            />
            <StatCard
              label="Cliques em Compra"
              value={metrics.click_buy}
              icon="💳"
              color="orange"
            />
            <StatCard
              label="Localização"
              value={metrics.click_location}
              icon="📍"
              color="green"
            />
            <StatCard
              label="WhatsApp"
              value={metrics.click_whatsapp}
              icon="💬"
              color="black"
            />
          </div>
        )}

        {/* ÁREA DE INSIGHTS PREMIUM */}
        <div className="mt-12 bg-[#0A0A0A] rounded-[2.5rem] p-8 md:p-16 border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-[300px] bg-orange-600/5 blur-[120px] -z-10" />
          
          <div className="flex flex-col gap-6 mb-16 border-l-4 border-orange-500 pl-8">
            <h3 className="text-3xl font-black uppercase tracking-tighter text-white">Visual Insights</h3>
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest tracking-[0.2em]">Análise de comportamento baseada em cliques reais</p>
          </div>

          {!showInsights ? (
            <div className="py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
              <p className="text-slate-500 font-black uppercase tracking-widest">Sem dados suficientes para gerar insights</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-20">
              
              {/* INSIGHT 1: ENGAJAMENTO (DONUT) */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="50%" cy="50%" r="70"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="50%" cy="50%" r="70"
                      stroke="#00F0FF"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray="440"
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 440 - (440 * engagementRate) / 100 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-white tracking-tighter">{engagementRate}%</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#00F0FF]">Engajamento</span>
                  </div>
                </div>
                <p className="mt-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Percentual de visitantes que realizaram alguma ação</p>
              </div>

              {/* INSIGHT 2: INATIVIDADE (HORIZONTAL PROGRESS) */}
              <div className="flex flex-col justify-center">
                <div className="mb-6 flex justify-between items-end">
                   <h4 className="text-[12px] font-black uppercase tracking-widest text-white">Taxa de Inatividade</h4>
                   <span className="text-2xl font-black text-[#FF3D00] tracking-tighter">{100 - engagementRate}%</span>
                </div>
                <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${100 - engagementRate}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-[#FF3D00] to-[#FF8A00] shadow-[0_0_20px_rgba(255,61,0,0.4)]"
                  />
                </div>
                <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Visitantes que não interagiram com nenhum botão</p>
              </div>

              {/* INSIGHT 3: INTENÇÃO DE COMPRA (GAUGE / SEMI-CIRCLE) */}
              <div className="flex flex-col items-center text-center">
                <div className="relative w-64 h-32 overflow-hidden flex items-end justify-center">
                   <svg className="w-64 h-64 absolute top-0">
                      <circle
                        cx="50%" cy="50%" r="100"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="18"
                        fill="transparent"
                        strokeDasharray="314 314"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        style={{ transform: 'rotate(180deg)', transformOrigin: 'center' }}
                      />
                      <motion.circle
                        cx="50%" cy="50%" r="100"
                        stroke="#7000FF"
                        strokeWidth="18"
                        fill="transparent"
                        strokeDasharray="314 314"
                        initial={{ strokeDashoffset: 314 }}
                        animate={{ strokeDashoffset: 314 - (314 * purchaseIntention) / 100 }}
                        transition={{ duration: 1.8, ease: "easeOut" }}
                        strokeLinecap="round"
                        style={{ transform: 'rotate(180deg)', transformOrigin: 'center' }}
                      />
                   </svg>
                   <div className="z-10 text-center pb-2">
                      <span className="text-4xl font-black text-white tracking-tighter">{purchaseIntention}%</span>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#7000FF]">Intenção de Compra</p>
                   </div>
                </div>
                <p className="mt-8 text-[11px] font-black uppercase tracking-widest text-slate-400">Percentual de visitantes que clicaram para comprar</p>
              </div>

            </div>
          )}
        </div>

        <div className="mt-20 p-8 border-2 border-[#0B1220] bg-slate-50">
          <h4 className="text-sm font-black uppercase tracking-widest text-[#0B1220] mb-4">Informação do Sistema</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Este sistema de tracking é ultra-leve e focado em privacidade. 
            Não coletamos IPs, sessões ou dados pessoais dos visitantes. 
            Cada registro representa uma ação única executada na rota <code className="bg-slate-200 px-1 rounded">/imersao-ia</code>.
          </p>
        </div>
      </div>
    </>
  );
}
