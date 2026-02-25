import { useState, useEffect, useMemo } from 'react';
import AdminTopbar from '../../components/admin/AdminTopbar';
import StatCard from '../../components/admin/StatCard';
import DataTable, { Column } from '../../components/admin/DataTable';
import { storageService } from '../../lib/storageService';
import { AdminProduct } from '../../types/admin';
import { AnalyticsEvent } from '../../types/analytics';
import { formatBRLFromCents } from '../../lib/format';

export default function Dashboard() {
  const [data, setData] = useState({
    products: [] as AdminProduct[],
    events: [] as AnalyticsEvent[],
    requests: [] as any[]
  });

  const loadData = () => {
    setData({
      products: storageService.getProducts(),
      events: storageService.getAnalyticsEvents(),
      requests: storageService.getPublicationRequests()
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener('ENT_STORAGE_UPDATED', loadData);
    return () => window.removeEventListener('ENT_STORAGE_UPDATED', loadData);
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
    else if (data.requests.filter(r => r.status === 'pending').length > 0) summary = "Você possui novas solicitações de publicação pendentes. Revise os parceiros para manter o marketplace atualizado.";

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
      <AdminTopbar title="Dashboard Real" />
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <StatCard 
            label="Faturamento (30d)" 
            value={metrics.revenue} 
            trend={{ value: `${metrics.revenueGrowth.toFixed(1)}%`, isPositive: metrics.revenueGrowth >= 0 }}
            icon="💰" color="green"
          />
          <StatCard 
            label="Conversões (30d)" 
            value={metrics.clients} 
            trend={{ value: `${metrics.clientGrowth.toFixed(1)}%`, isPositive: metrics.clientGrowth >= 0 }}
            icon="👤" color="blue"
          />
          <StatCard 
            label="Soluções Ativas" 
            value={metrics.activeProducts} 
            trend={{ value: `${metrics.pendingProducts} pendentes`, isPositive: metrics.pendingProducts === 0 }}
            icon="🚀" color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h4 className="text-lg font-black">Acessos da Semana</h4>
                <p className="text-sm text-slate-500">Visualizações de página por dia</p>
              </div>
              <div className="text-right">
                <h2 className="text-2xl font-black">{metrics.totalViews.toLocaleString()}</h2>
                <span className="text-xs font-bold text-slate-400 uppercase">Page Views</span>
              </div>
            </div>
            <div className="flex items-end justify-between h-48 gap-2 px-2">
              {metrics.dailyViews.map((v, i) => {
                const max = Math.max(...metrics.dailyViews, 1);
                const height = (v / max) * 100;
                return (
                  <div key={i} className="flex flex-col items-center flex-1 gap-2 group relative">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">{v}</div>
                    <div className="w-full bg-slate-100 rounded-t-lg transition-all hover:bg-[#0052cc]/40" style={{ height: `${height}%` }}></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#0052cc] p-6 md:p-8 rounded-2xl text-white flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-black mb-4">Resumo Operacional</h4>
              <p className="text-white/80 text-sm leading-relaxed">{metrics.summary}</p>
            </div>
            <button className="w-full py-4 bg-white text-[#0052cc] font-black rounded-xl text-sm hover:bg-slate-50 transition-colors mt-8">Ver Relatório Completo</button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-black">Soluções Recentes</h4>
          <DataTable data={data.products.slice(0, 5)} columns={columns} />
        </div>
      </div>
    </>
  );
}