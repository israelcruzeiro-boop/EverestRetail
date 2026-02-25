import { useState, useEffect } from 'react';
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
    if (confirm('ATENÇÃO: Isso irá apagar TODOS os dados (produtos, parceiros, usuários) e restaurar os dados iniciais. Continuar?')) {
      storageService.resetAll();
      window.location.reload();
    }
  };

  return (
    <>
      <AdminTopbar title="Ajustes" />
      <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-6 md:space-y-8">
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Identidade do Admin</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm font-bold text-slate-500">Nome da Plataforma</span>
              <span className="text-sm font-black text-slate-900 text-right">{settings.platformName}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-sm font-bold text-slate-500">Tema Ativo</span>
              <span className="text-sm font-black text-slate-900 text-right">{settings.theme}</span>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Preferências</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Permitir preços visíveis sem login</p>
                <p className="text-xs text-slate-500">Se desativado, usuários devem logar para ver valores.</p>
              </div>
              <button 
                onClick={() => handleToggle('allowPublicPrices')}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.allowPublicPrices ? 'bg-[#0052cc]' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.allowPublicPrices ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">Exigir aprovação para novos parceiros</p>
                <p className="text-xs text-slate-500">Novos cadastros entrarão como pendentes.</p>
              </div>
              <button 
                onClick={() => handleToggle('requirePartnerApproval')}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.requirePartnerApproval ? 'bg-[#0052cc]' : 'bg-slate-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.requirePartnerApproval ? 'left-7' : 'left-1'}`}></div>
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-red-50">
            <h3 className="text-sm font-black text-red-600 uppercase tracking-widest">Zona de Perigo</h3>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-500 mb-6">Resetar os dados irá limpar todo o localStorage e restaurar os dados de exemplo.</p>
            <button 
              onClick={handleReset}
              className="px-6 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-all"
            >
              Resetar dados do Admin
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
