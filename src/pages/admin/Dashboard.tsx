import { useState, useEffect, useMemo } from 'react';
import AdminTopbar from '../../components/admin/AdminTopbar';
import StatCard from '../../components/admin/StatCard';
import DataTable, { Column } from '../../components/admin/DataTable';
import { supabaseService } from '../../lib/supabaseService';
import { supabase } from '../../lib/supabase';
import { AdminProduct } from '../../types/admin';
import { AnalyticsEvent } from '../../types/analytics';
import { analyticsRepo } from '@/lib/repositories/analyticsRepo';
import { formatBRLFromCents } from '../../lib/format';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    products: [] as AdminProduct[],
    events: [] as AnalyticsEvent[],
    requests: [] as any[]
  });
  const [dbMetrics, setDbMetrics] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    const [products, events, requests, metrics] = await Promise.all([
      supabaseService.getProducts(),
      supabaseService.getAnalyticsEvents(),
      supabaseService.getPublicationRequests(),
      analyticsRepo.getDashboardMetrics()
    ]);
    setData({ products, events, requests });
    if (metrics) {
      setDbMetrics(metrics);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cálculos de Período
  const metrics = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const currentEvents = data.events.filter(e => new Date(e.timestamp) >= thirtyDaysAgo);
    const previousEvents = data.events.filter(e => {
      const d = new Date(e.timestamp);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    });

    // 1. FATURAMENTO (GMV)
    const currentRevenue = currentEvents
      .filter(e => e.type === 'checkout_confirmed')
      .reduce((acc, e) => acc + (e.meta?.priceCents || 0), 0);

    const previousRevenue = previousEvents
      .filter(e => e.type === 'checkout_confirmed')
      .reduce((acc, e) => acc + (e.meta?.priceCents || 0), 0);

    const revenueGrowth = previousRevenue === 0 ? 100 : ((currentRevenue - previousRevenue) / previousRevenue) * 100;

    // 2. NOVOS CLIENTES (Sessões Únicas com Conversão)
    const currentClients = new Set(
      currentEvents
        .filter(e => e.type === 'checkout_confirmed' || e.type === 'schedule_confirmed')
        .map(e => e.sessionId)
    ).size;

    const previousClients = new Set(
      previousEvents
        .filter(e => e.type === 'checkout_confirmed' || e.type === 'schedule_confirmed')
        .map(e => e.sessionId)
    ).size;

    const clientGrowth = previousClients === 0 ? 100 : ((currentClients - previousClients) / previousClients) * 100;

    // 3. SOLUÇÕES ATIVAS
    const activeProducts = data.products.filter(p => p.status === 'active').length;
    const pendingProducts = data.products.filter(p => p.status === 'pending').length;

    // 4. ACESSOS SEMANAIS (Gráfico)
    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    const todayIndex = (now.getDay() + 6) % 7; // Ajuste para Seg=0

    const dailyViews = Array(7).fill(0);
    currentEvents.filter(e => e.type === 'page_view').forEach(e => {
      const d = new Date(e.timestamp);
      const diff = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
      if (diff < 7) {
        const idx = (d.getDay() + 6) % 7;
        dailyViews[idx]++;
      }
    });

    const totalViews = dailyViews.reduce((a, b) => a + b, 0);

    // 5. RESUMO OPERACIONAL
    let summary = "O ecossistema está estável. Continue monitorando as interações no marketplace.";
    const checkouts = currentEvents.filter(e => e.type === 'checkout_confirmed').length;
    const productViews = currentEvents.filter(e => e.type === 'product_view').length;
    const conversionRate = productViews > 0 ? (checkouts / productViews) * 100 : 0;

    if (revenueGrowth > 10) summary = "Excelente desempenho! O faturamento cresceu significativamente este mês. Considere expandir o mix de produtos.";
    else if (conversionRate < 2 && productViews > 5) summary = "Atenção: Muitos usuários visualizam produtos, mas poucos convertem. Revise as descrições e CTAs.";
    else if (data.requests.filter(r => r.status === 'submitted').length > 0) summary = "Você possui novas solicitações de publicação pendentes. Revise os parceiros para manter o marketplace atualizado.";

    return {
      revenue: formatBRLFromCents(currentRevenue),
      revenueGrowth,
      clients: currentClients,
      clientGrowth,
      activeProducts,
      pendingProducts,
      dailyViews,
      totalViews,
      summary
    };
  }, [data]);

  const columns: Column<AdminProduct>[] = [
    { header: 'Produto', accessor: (p) => <span className="font-bold">{p.name}</span> },
    { header: 'Categoria', accessor: 'category' },
    { header: 'Preço', accessor: (p) => formatBRLFromCents(p.priceCents) }
  ];

  return (
    <>
      <AdminTopbar title="Painel de Controle" />
      <div className="p-4 md:p-12 max-w-7xl mx-auto space-y-12 md:space-y-20">
        {loading ? (
          <div className="h-64 flex items-center justify-center border-4 border-[#0B1220] bg-white">
            <div className="text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Sincronizando Metrics Center...</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 border-2 border-[#0B1220]">
              <StatCard
                label="Conversões (Sumário)"
                value={dbMetrics?.monthlyConversions ?? metrics.clients}
                trend={{ value: `${metrics.clientGrowth.toFixed(1)}%`, isPositive: metrics.clientGrowth >= 0 }}
                icon="💰" color="green"
              />
              <StatCard
                label="Sessões Únicas (30d)"
                value={metrics.clients}
                trend={{ value: `${metrics.clientGrowth.toFixed(1)}%`, isPositive: metrics.clientGrowth >= 0 }}
                icon="👤" color="blue"
              />
              <StatCard
                label="Soluções Ativas"
                value={dbMetrics?.activeProducts ?? metrics.activeProducts}
                trend={{ value: `${dbMetrics?.pendingRequests ?? metrics.pendingProducts} pendentes`, isPositive: (dbMetrics?.pendingRequests ?? metrics.pendingProducts) === 0 }}
                icon="🚀" color="black"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 border-2 border-[#0B1220]">
              <div className="lg:col-span-2 bg-white p-8 md:p-12 border-r-2 border-[#0B1220]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-16 px-4 border-l-8 border-[#1D4ED8]">
                  <div>
                    <h4 className="text-2xl font-black uppercase tracking-tighter">Acessos da Semana</h4>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">Métricas de tráfego em tempo real</p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-5xl font-black text-[#0B1220] tracking-tighter uppercase">{metrics.totalViews.toLocaleString()}</h2>
                    <span className="text-[10px] font-black text-[#1D4ED8] uppercase tracking-[0.3em]">Total Page Views</span>
                  </div>
                </div>
                <div className="flex items-end justify-between h-56 gap-4 px-4 overflow-hidden">
                  {metrics.dailyViews.map((v, i) => {
                    const max = Math.max(...metrics.dailyViews, 1);
                    const height = (v / max) * 100;
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 gap-4 group relative">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0B1220] text-white text-[10px] font-black px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 border-2 border-white">{v}</div>
                        <div className="w-full bg-slate-100 transition-all hover:bg-[#FF4D00] border-2 border-[#0B1220] border-b-0" style={{ height: `${height}%` }}></div>
                        <span className="text-[10px] font-black text-[#0B1220] uppercase tracking-widest">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#0B1220] p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1D4ED8]/20 -mr-16 -mt-16 blur-3xl"></div>
                <div>
                  <div className="inline-block bg-[#FF4D00] text-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] mb-8">Status Geral</div>
                  <h4 className="text-3xl font-black mb-6 uppercase tracking-tighter leading-none">Resumo Operacional</h4>
                  <p className="text-slate-400 text-lg leading-snug font-medium uppercase tracking-tight">{metrics.summary}</p>
                </div>
                <button className="w-full py-6 bg-[#1D4ED8] text-white font-black text-xs uppercase tracking-[0.5em] border-2 border-white hover:bg-[#FF4D00] transition-colors mt-12 shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] active:shadow-none active:translate-x-1 active:translate-y-1">Relatório Completo</button>
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-4 h-4 bg-[#FF4D00] border-2 border-[#0B1220]"></div>
                <h4 className="text-2xl font-black uppercase tracking-tighter">Soluções Recentes</h4>
              </div>
              <div className="border-4 border-[#0B1220] shadow-[12px_12px_0px_0px_rgba(29,78,216,1)]">
                <DataTable<AdminProduct> data={data.products.slice(0, 5)} columns={[
                  { header: 'SOLUÇÃO / PRODUTO', accessor: (p) => <span className="font-black uppercase text-[#0B1220]">{p.name}</span> },
                  { header: 'VERTICAL', accessor: (p) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{p.category}</span> },
                  { header: 'VALOR NOMINAL', accessor: (p) => <span className="font-black text-[#1D4ED8]">{formatBRLFromCents(p.priceCents)}</span> }
                ]} />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}