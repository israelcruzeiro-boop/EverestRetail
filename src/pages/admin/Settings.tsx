import { useState } from 'react';
import AdminTopbar from '../../components/admin/AdminTopbar';
import { storageService } from '../../lib/storageService';
import { AdminSettings } from '../../types/admin';

export default function Settings() {
  const [settings, setSettings] = useState<AdminSettings>(storageService.getSettings());

  const handleToggle = (key: keyof AdminSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    storageService.saveSettings(updated);
  };

  const handleReset = () => {
    if (confirm('ATENÇÃO: Isso irá apagar TODOS os dados e restaurar os iniciais. Continuar?')) {
      storageService.resetAll();
      window.location.reload();
    }
  };

  const generateTestData = () => {
    const now = new Date();
    const events = [];
    const types = ['page_view', 'product_view', 'checkout_confirmed'];
    
    for (let i = 0; i < 50; i++) {
      const pastDate = new Date(now.getTime() - Math.random() * 35 * 24 * 60 * 60 * 1000);
      events.push({
        id: Math.random().toString(36).substr(2, 9),
        type: types[Math.floor(Math.random() * types.length)],
        timestamp: pastDate.toISOString(),
        sessionId: 'test-session-' + Math.floor(Math.random() * 10),
        meta: { priceCents: 15000 + Math.random() * 50000 }
      });
    }
    storageService.saveAnalyticsEvents(events);
    alert('50 eventos de teste gerados!');
  };

  return (
    <>
      <AdminTopbar title="Ajustes" />
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 md:space-y-8">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h3 className="text-sm font-black uppercase tracking-widest">Ferramentas de Dados</h3></div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Analytics em Tempo Real</p>
                <p className="text-xs text-slate-500">Gerencie os eventos coletados no marketplace.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={generateTestData} className="px-4 py-2 bg-blue-50 text-[#0052cc] rounded-lg text-xs font-bold">Gerar Teste</button>
                <button onClick={() => storageService.clearAnalytics()} className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold">Limpar</button>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-red-50"><h3 className="text-sm font-black text-red-600 uppercase tracking-widest">Zona de Perigo</h3></div>
          <div className="p-6">
            <button onClick={handleReset} className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100">Resetar Sistema</button>
          </div>
        </section>
      </div>
    </>
  );
}