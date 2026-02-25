import { useState, useEffect } from 'react';
import AdminTopbar from '../../components/admin/AdminTopbar';
import StatCard from '../../components/admin/StatCard';
import DataTable, { Column } from '../../components/admin/DataTable';
import { storageService } from '../../lib/storageService';
import { AdminProduct } from '../../types/admin';
import { formatBRLFromCents } from '../../lib/format';

export default function Dashboard() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [stats, setStats] = useState({
    revenue: 'R$ 45.200,00',
    clients: '1.284',
    solutions: '24'
  });

  useEffect(() => {
    setProducts(storageService.getProducts().slice(0, 3));
  }, []);

  const columns: Column<AdminProduct>[] = [
    {
      header: 'Produto',
      accessor: (p) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-100 rounded flex items-center justify-center text-lg">📦</div>
          <span className="font-bold text-slate-900">{p.name}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (p) => (
        <span className={`
          inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider
          ${p.status === 'active' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}
        `}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'active' ? 'bg-green-700' : p.status === 'pending' ? 'bg-blue-700' : 'bg-slate-700'}`}></span>
          {p.status === 'active' ? 'Publicado' : p.status === 'pending' ? 'Ativo' : 'Rascunho'}
        </span>
      )
    },
    {
      header: 'Preço',
      accessor: (p) => formatBRLFromCents(p.priceCents),
      className: 'font-bold text-slate-900'
    }
  ];

  return (
    <>
      <AdminTopbar title="Dashboard" />
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <StatCard 
            label="Faturamento Total" 
            value={stats.revenue} 
            trend={{ value: '+12.5%', isPositive: true }}
            icon="💰"
            color="green"
          />
          <StatCard 
            label="Novos Clientes" 
            value={stats.clients} 
            trend={{ value: '+8.2%', isPositive: true }}
            icon="👤"
            color="blue"
          />
          <StatCard 
            label="Soluções Ativas" 
            value={stats.solutions} 
            trend={{ value: '+2.4%', isPositive: true }}
            icon="🚀"
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h4 className="text-lg font-black text-slate-900">Acessos Semanais</h4>
                <p className="text-sm text-slate-500">Visualizações de conteúdo nos últimos 7 dias</p>
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black text-slate-900">145.200</h2>
                <span className="text-xs font-bold text-green-600">+15.4%</span>
              </div>
            </div>
            <div className="flex items-end justify-between h-48 gap-2 md:gap-4 px-2">
              {[50, 35, 85, 60, 75, 40, 55].map((h, i) => (
                <div key={i} className="flex flex-col items-center flex-1 gap-2">
                  <div 
                    className={`w-full rounded-t-lg transition-all ${i === 2 ? 'bg-[#0052cc]' : 'bg-slate-100 hover:bg-[#0052cc]/40'}`} 
                    style={{ height: `${h}%` }}
                  ></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0052cc] p-6 md:p-8 rounded-2xl text-white shadow-lg flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-black mb-4">Resumo Operacional</h4>
              <p className="text-white/80 text-sm leading-relaxed">
                O desempenho desta semana superou a meta em 12%. Recomendamos aumentar o orçamento dos anúncios de Parceiros Nível Ouro.
              </p>
            </div>
            <button className="w-full py-4 bg-white text-[#0052cc] font-black rounded-xl text-sm hover:bg-slate-50 transition-colors mt-8">
              Ver Relatório Completo
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-black text-slate-900">Conteúdos Recentes</h4>
            <button className="text-sm font-bold text-[#0052cc] hover:underline">Ver Todos</button>
          </div>
          <DataTable data={products} columns={columns} />
        </div>
      </div>
    </>
  );
}
